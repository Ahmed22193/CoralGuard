export const findOne = async({
    model,filter={},select="",populate 
    }={})=>{
    return await model.findOne(filter).select(select).populate(populate);
}

export const findAll = async ({
  model,
  filter = {},
  select = "",
  populate,
} = {}) => {
  let query = model.find(filter).select(select);
  if (populate) query = query.populate(populate);
  return await query;
};

export const find = async ({
  model,
  filter = {},
  select = "",
  populate,
  sort = {},
  skip = 0,
  limit = 0
} = {}) => {
  let query = model.find(filter).select(select);
  if (populate) query = query.populate(populate);
  if (Object.keys(sort).length > 0) query = query.sort(sort);
  if (skip > 0) query = query.skip(skip);
  if (limit > 0) query = query.limit(limit);
  return await query;
};

export const count = async ({
  model,
  filter = {}
} = {}) => {
  return await model.countDocuments(filter);
};

export const findById = async({
    model,id="",select="",populate 
    }={})=>{
    return await model.findById(id).select(select).populate(populate);
}

export const create = async({
    model,data={},options={validateBeforeSave : true}
    }={})=>{        
    return await model.create([data],options);
}

export const updateOne = async ({
  model,
  filter = {},
  data = {},
  options = { new: true, runValidators: true }
} = {}) => {
  return await model.findOneAndUpdate(filter, data, options);
};

export const updateById = async ({
  model,
  id = "",
  data = {},
  options = { new: true, runValidators: true }
} = {}) => {
  return await model.findByIdAndUpdate(id, data, options);
};

export const deleteOne = async ({
  model,
  filter = {}
} = {}) => {
  return await model.findOneAndDelete(filter);
};

export const deleteById = async ({
  model,
  id = ""
} = {}) => {
  return await model.findByIdAndDelete(id);
};