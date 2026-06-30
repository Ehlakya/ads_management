const { Ad, Quotation } = require('../models');

// @desc    Create a new Ad
// @route   POST /api/ads
exports.createAd = async (req, res) => {
  const { title, client, status, budget, video_url, quoted_amount } = req.body;
  
  let finalVideoUrl = video_url;
  if (req.file) {
    // Determine the base URL dynamically or use relative path
    finalVideoUrl = `/uploads/${req.file.filename}`;
  }

  try {
    const ad = await Ad.create({
      title,
      client,
      status: status || 'active',
      budget,
      video_url: finalVideoUrl,
      created_by: req.user.id,
    });

    if (quoted_amount) {
      await Quotation.create({
        ad_id: ad.id,
        amount: quoted_amount,
        status: 'pending',
        notes: 'Initial quotation generated during campaign creation.',
      });
    }

    res.status(201).json({ success: true, data: ad, message: 'Ad created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all Ads
// @route   GET /api/ads
exports.getAds = async (req, res) => {
  try {
    const ads = await Ad.findAll({
      order: [['created_at', 'DESC']]
    });
    res.status(200).json({ success: true, data: ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Ad by ID
// @route   GET /api/ads/:id
exports.getAdById = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id, {
      include: [{ model: Quotation, required: false }]
    });
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }
    res.status(200).json({ success: true, data: ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an Ad
// @route   PUT /api/ads/:id
exports.updateAd = async (req, res) => {
  const { title, client, status, budget, video_url, quoted_amount } = req.body;
  
  let finalVideoUrl = video_url;
  if (req.file) {
    finalVideoUrl = `/uploads/${req.file.filename}`;
  }

  try {
    const ad = await Ad.findByPk(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }
    
    await ad.update({
      title: title !== undefined ? title : ad.title,
      client: client !== undefined ? client : ad.client,
      status: status !== undefined ? status : ad.status,
      budget: budget !== undefined ? budget : ad.budget,
      video_url: finalVideoUrl !== undefined ? finalVideoUrl : ad.video_url,
    });

    if (quoted_amount !== undefined) {
      const existingQuotation = await Quotation.findOne({ where: { ad_id: ad.id } });
      if (existingQuotation) {
        await existingQuotation.update({ amount: quoted_amount });
      } else if (quoted_amount) {
        await Quotation.create({
          ad_id: ad.id,
          amount: quoted_amount,
          status: 'pending',
          notes: 'Quotation added during campaign update.',
        });
      }
    }

    res.status(200).json({ success: true, data: ad, message: 'Ad updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

