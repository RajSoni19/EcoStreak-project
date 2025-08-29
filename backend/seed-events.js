const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Sample events data
const sampleEvents = [
  {
    title: "Community Tree Planting Day",
    description: "Join us for a day of environmental conservation as we plant native trees in our local park. This event aims to increase green cover and promote biodiversity in our community.",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
    location: {
      address: "Central Park",
      city: "New York",
      state: "NY",
      country: "USA",
      isVirtual: false,
      coordinates: [-74.006, 40.7128]
    },
    category: "tree-planting",
    maxParticipants: 50,
    pointsForAttendance: 25,
    pointsForCompletion: 75,
    tags: ["conservation", "community", "biodiversity"],
    status: "upcoming",
    isActive: true
  },
  {
    title: "Environmental Awareness Workshop",
    description: "Learn about climate change, sustainable living practices, and how to reduce your carbon footprint. Interactive sessions with environmental experts.",
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
    location: {
      address: "Community Center",
      city: "Los Angeles",
      state: "CA",
      country: "USA",
      isVirtual: false,
      coordinates: [-118.2437, 34.0522]
    },
    category: "workshop",
    maxParticipants: 30,
    pointsForAttendance: 20,
    pointsForCompletion: 60,
    tags: ["education", "climate-change", "sustainability"],
    status: "upcoming",
    isActive: true
  },
  {
    title: "Beach Cleanup Initiative",
    description: "Help clean up our local beach and protect marine life. We'll provide all necessary equipment. Great opportunity to make a difference and meet like-minded environmentalists.",
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
    location: {
      address: "Santa Monica Beach",
      city: "Los Angeles",
      state: "CA",
      country: "USA",
      isVirtual: false,
      coordinates: [-118.4965, 34.0195]
    },
    category: "cleanup",
    maxParticipants: 100,
    pointsForAttendance: 30,
    pointsForCompletion: 80,
    tags: ["cleanup", "marine-life", "ocean-conservation"],
    status: "upcoming",
    isActive: true
  },
  {
    title: "Renewable Energy Seminar",
    description: "Discover the latest developments in renewable energy technologies and how they can benefit your home and community. Experts will discuss solar, wind, and other sustainable energy sources.",
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
    location: {
      address: "Tech Innovation Center",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      isVirtual: true,
      virtualLink: "https://meet.google.com/sample-link"
    },
    category: "workshop",
    maxParticipants: 75,
    pointsForAttendance: 25,
    pointsForCompletion: 70,
    tags: ["renewable-energy", "technology", "sustainability"],
    status: "upcoming",
    isActive: true
  },
  {
    title: "Urban Garden Project",
    description: "Learn to create and maintain urban gardens that promote local food production and reduce carbon footprint. Hands-on workshop with gardening experts.",
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // 5 hours later
    location: {
      address: "Urban Farm",
      city: "Chicago",
      state: "IL",
      country: "USA",
      isVirtual: false,
      coordinates: [-87.6298, 41.8781]
    },
    category: "workshop",
    maxParticipants: 25,
    pointsForAttendance: 20,
    pointsForCompletion: 65,
    tags: ["urban-farming", "local-food", "sustainability"],
    status: "upcoming",
    isActive: true
  }
];

async function seedEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define schemas inline for seeding
    const userSchema = new mongoose.Schema({
      fullName: String,
      email: String,
      password: String,
      role: String,
      organizationName: String,
      isActive: Boolean
    });

    const eventSchema = new mongoose.Schema({
      title: String,
      description: String,
      organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      startDate: Date,
      endDate: Date,
      location: {
        address: String,
        city: String,
        state: String,
        country: String,
        coordinates: [Number],
        isVirtual: Boolean,
        virtualLink: String
      },
      category: String,
      tags: [String],
      maxParticipants: Number,
      participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      pointsForAttendance: Number,
      pointsForCompletion: Number,
      isPublic: Boolean,
      isActive: Boolean,
      status: String
    });

    const User = mongoose.model('User', userSchema);
    const Event = mongoose.model('Event', eventSchema);

    // Find a user to use as organizer (or create one if none exists)
    let organizer = await User.findOne({ role: 'ngo' });
    
    if (!organizer) {
      console.log('⚠️ No NGO user found. Creating a sample NGO user...');
      organizer = new User({
        fullName: 'Sample NGO',
        email: 'sample@ngo.com',
        password: 'password123',
        role: 'ngo',
        organizationName: 'Environmental Conservation NGO',
        isActive: true
      });
      await organizer.save();
      console.log('✅ Created sample NGO user');
    }

    // Clear existing events
    await Event.deleteMany({});
    console.log('✅ Cleared existing events');

    // Create events with the organizer
    const eventsWithOrganizer = sampleEvents.map(event => ({
      ...event,
      organizer: organizer._id,
      participants: [],
      isPublic: true
    }));

    const createdEvents = await Event.insertMany(eventsWithOrganizer);
    console.log(`✅ Created ${createdEvents.length} sample events`);

    // Display created events
    console.log('\n📅 Sample Events Created:');
    createdEvents.forEach(event => {
      console.log(`- ${event.title} (${event.category}) - ${event.location.city}, ${event.location.state}`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed function
seedEvents();
