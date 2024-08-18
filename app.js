const express = require('express');
const mongoose =  require('mongoose');
const cors = require('cors');

require('dotenv').config();
const app = express();
app.use(cors());
mongoose.connect(process.env.MONGODB_URI)
.then(()=> console.log("MongoDB connected"))
.catch(err=> console.log(err));


app.listen(3000,()=> {
    console.log('Server is running on port 3000');
});

app.get('/api/sales-over-time', async (req, res) => {
    try {
        const sales = await mongoose.connection.db.collection('shopifyOrders').aggregate([
            {
                $addFields: {
                    created_at_date: {
                        $dateFromString: { dateString: "$created_at" }
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$created_at_date" } },
                    totalSales: { $sum: "$total_price" }
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray();
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



app.get('/api/sales-growth-rate', async (req, res) => {
    try {
        const sales = await mongoose.connection.db.collection('shopifyorders').aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
                    totalSales: { $sum: "$total_price" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]).toArray();

        const growthRates = sales.map((current, index, array) => {
            if (index === 0) return { ...current, growthRate: 0 };
            const previous = array[index - 1].totalSales;
            const growthRate = ((current.totalSales - previous) / previous) * 100;
            return { ...current, growthRate };
        });

        res.json(growthRates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


        app.get('/api/new-customers', async (req, res) => {
            try {
                const newCustomers = await mongoose.connection.db.collection('shopifyCustomers').aggregate([
                    {
                        $addFields: {
                            created_at_date: {
                                $dateFromString: { dateString: "$created_at" }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m", date: "$created_at_date" } },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { _id: 1 }
                    }
                ]).toArray();
        
                res.json(newCustomers);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
        
        app.get('/api/repeat-customers', async (req, res) => {
            try {
                const repeatCustomers = await mongoose.connection.db.collection('shopifyOrders').aggregate([
                    {
                        $group: {
                            _id: "$customer_id",
                            purchaseCount: { $sum: 1 }
                        }
                    },
                    {
                        $match: { purchaseCount: { $gt: 1 } }
                    },
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 }
                        }
                    }
                ]).toArray();
        
                res.json(repeatCustomers);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
        
        app.get('/api/customer-distribution', async (req, res) => {
            try {
                const distribution = await mongoose.connection.db.collection('shopifyCustomers').aggregate([
                    {
                        $group: {
                            _id: "$default_address.city",
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { count: -1 }
                    }
                ]).toArray();
        
                res.json(distribution);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
        
        app.get('/api/customer-lifetime-value', async (req, res) => {
            try {
                const cohorts = await mongoose.connection.db.collection('shopifyOrders').aggregate([
                    {
                        $lookup: {
                            from: 'shopifyCustomers',
                            localField: 'customer_id',
                            foreignField: '_id',
                            as: 'customer'
                        }
                    },
                    {
                        $unwind: "$customer"
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m", date: "$customer.created_at" } },
                            lifetimeValue: { $sum: "$total_price_set" }
                        }
                    },
                    {
                        $sort: { _id: 1 }
                    }
                ]).toArray();
        
                res.json(cohorts);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
        
        





