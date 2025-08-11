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