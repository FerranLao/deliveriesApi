import Deliveries from '@/models/Deliveries.model';
import Products from '@/models/Products.model';

const find = async (req) => {
  // some vars
  const query = {};
  const limit = req.query.limit
    ? req.query.limit > 100
      ? 100
      : parseInt(req.query.limit)
    : 100;
  const skip = req.query.page
    ? (Math.max(0, parseInt(req.body.page)) - 1) * limit
    : 0;
  const sort = { _id: 1 };

  // if date provided, filter by date
  if (req.body.when) {
    query['when'] = {
      $gte: req.body.when,
    };
  }

  if (req.body.dateFrom) {
    query.when = { ...query.when, $gte: new Date(req.query.dateFrom) };
  }

  if (req.body.dateTo) {
    query.when = { ...query.when, $lte: new Date(req.query.dateTo) };
  }

  if (req.body.weight) {
    const prodIds = await Products.find({ weight: req.body.weight }, '_id');

    query.products = { $in: prodIds.map((e) => e._id) };
  }
  const totalResults = await Deliveries.find(query).countDocuments();
  const deliveries = await Deliveries.find(query)
    .populate('products')
    .skip(skip)
    .limit(limit)
    .sort(sort);

  if (totalResults < 1) {
    throw {
      code: 404,
      data: {
        message: 'We couldn\'t find any delivery',
      },
    };
  }

  return { totalResults, deliveries };
};

const create = async (req) => {
  try {
    await Deliveries.create(req.body);
  } catch (e) {
    throw {
      code: 400,
      data: {
        message: `An error has occurred trying to create the delivery:
          ${JSON.stringify(e, null, 2)}`,
      },
    };
  }
};

const findOne = async (req) => {
  let delivery = await Deliveries.findOne({ _id: req.body.id });
  if (!delivery) {
    throw {
      code: 404,
      data: {
        message: 'We couldn\'t find a delivery with the sent ID',
      },
    };
  }
  return delivery;
};

export default {
  find,
  create,
  findOne,
};
