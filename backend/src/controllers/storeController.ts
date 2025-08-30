import { Request, Response } from 'express';
import { Store } from '@/models/Store';
import { User } from '@/models/User';

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, image, stock, pointsCost, ecoRating } = req.body;
    
    const product = new Store({
      name,
      description,
      price,
      category,
      image,
      stock,
      pointsCost,
      ecoRating,
      seller: req.user._id,
      isActive: true,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });

  } catch (error: any) {
    console.error('Create product error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 12, category, search, minPrice, maxPrice, sortBy, sortOrder } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { isActive: true };
    
    if (category) filter.category = category;
    if (search) {
      filter.$text = { $search: search };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortOptions: any = {};
    if (sortBy && sortOrder) {
      sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const products = await Store.find(filter)
      .populate('seller', 'fullName organizationName avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Store.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });

  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Store.findById(id)
      .populate('seller', 'fullName organizationName avatar');

    if (!product || !product.isActive) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { product }
    });

  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Store.findById(id);
    
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    // Check if user is seller
    if (!product.seller.equals(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'Only seller can update product'
      });
      return;
    }

    const updatedProduct = await Store.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('seller', 'fullName organizationName avatar');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });

  } catch (error: any) {
    console.error('Update product error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Store.findById(id);
    
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    // Check if user is seller
    if (!product.seller.equals(req.user._id)) {
      res.status(403).json({
        success: false,
        message: 'Only seller can delete product'
      });
      return;
    }

    await Store.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const purchaseProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;
    const userId = req.user._id;

    const product = await Store.findById(id);
    
    if (!product || !product.isActive) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
      return;
    }

    const totalCost = product.pointsCost * quantity;
    const user = await User.findById(userId);

    if (!user || (user.totalPoints || 0) < totalCost) {
      res.status(400).json({
        success: false,
        message: 'Insufficient points'
      });
      return;
    }

    // Deduct points from user
    user.totalPoints = (user.totalPoints || 0) - totalCost;
    await user.save();

    // Update product stock
    product.stock -= quantity;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product purchased successfully',
      data: {
        product,
        quantity,
        pointsSpent: totalCost,
        remainingPoints: user.totalPoints
      }
    });

  } catch (error: any) {
    console.error('Purchase product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getSellerProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const sellerId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { seller: sellerId };
    if (status !== undefined) filter.isActive = status === 'active';

    const products = await Store.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Store.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });

  } catch (error: any) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Store.distinct('category');
    
    res.status(200).json({
      success: true,
      data: { categories }
    });

  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
