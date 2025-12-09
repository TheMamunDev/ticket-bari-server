const { db } = require('../config/db.js');
const ticketsCollection = db.collection('tickets');
const bookedTicketsCollection = db.collection('bookings');
const paymentsCollection = db.collection('payments');

const getWeeklyRevenue = async (req, res) => {
  try {
    const email = req.params.email;
    console.log(email);

    const filter = {
      status: 'paid',
      vendorEmail: email,
      paidAt: { $ne: null },
    };

    const agg = await bookedTicketsCollection
      .aggregate([
        { $match: filter },
        {
          $group: {
            _id: { $dayOfWeek: '$paidAt' },
            revenue: { $sum: '$totalPrice' },
            sales: { $sum: '$quantity' },
          },
        },
      ])
      .toArray();

    const dayMap = {
      1: 'Sun',
      2: 'Mon',
      3: 'Tue',
      4: 'Wed',
      5: 'Thu',
      6: 'Fri',
      7: 'Sat',
    };
    const revenueData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
      day => ({
        name: day,
        revenue: 0,
        sales: 0,
      })
    );

    agg.forEach(item => {
      const dayName = dayMap[item._id];
      const index = revenueData.findIndex(d => d.name === dayName);
      if (index !== -1) {
        revenueData[index] = {
          name: dayName,
          revenue: item.revenue,
          sales: item.sales,
        };
      }
    });

    const revAgg = await bookedTicketsCollection
      .aggregate([
        { $match: filter },
        { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
      ])
      .toArray();
    const totalRevenue = revAgg[0]?.totalRevenue || 0;

    const revenueStats = await bookedTicketsCollection
      .aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
            totalSold: { $sum: '$quantity' },
          },
        },
      ])
      .toArray();

    const ticketStats = await bookedTicketsCollection
      .aggregate([
        { $match: { vendorEmail: email } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            status: '$_id',
            count: 1,
          },
        },
      ])
      .toArray();

    const totalTickets = await ticketsCollection.countDocuments({
      vendorEmail: email,
    });

    res.send({
      revenueData,
      totalRevenue,
      revenueStats,
      ticketStats,
      totalTickets,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getWeeklyRevenue };
