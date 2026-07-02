const { Sale, Ad, User } = require('../models');

// @desc    Add a new sale record
// @route   POST /api/sales
exports.createSale = async (req, res) => {
  const { ad_id, theater_name, sale_amount, theater_address } = req.body;
  try {
    const sale = await Sale.create({
      ad_id,
      agent_id: req.user.id,
      theater_name,
      sale_amount,
      theater_address,
      status: 'pending'
    });
    res.status(201).json({ success: true, data: sale, message: 'Sale record submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all sales records
// @route   GET /api/sales
exports.getSales = async (req, res) => {
  try {
    const whereClause = {};
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
      whereClause.agent_id = req.user.id;
    }

    const sales = await Sale.findAll({
      where: whereClause,
      include: [
        { model: Ad, attributes: ['title'] },
        { model: User, attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    // Flatten data to match what the frontend expects
    const formattedSales = sales.map(sale => ({
      ...sale.toJSON(),
      ad_title: sale.Ad ? sale.Ad.title : null,
      agent_name: sale.User ? sale.User.name : null,
    }));

    res.status(200).json({ success: true, data: formattedSales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update sale status (Approve/Reject)
// @route   PUT /api/sales/:id/status
exports.updateSaleStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const sale = await Sale.findByPk(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale record not found' });
    }
    
    await sale.update({ status });
    res.status(200).json({ success: true, data: sale, message: `Sale record ${status} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
