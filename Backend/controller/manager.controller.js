const User = require('../models/user.model')

const CreateManager = async (req,res,next) => {
    try{
        const {name,email,password,phone,designation} = req.body
        
        if(!name || !email || !password || !phone || !designation) {
            return res.status(400).json({ msg: "all are required" })
        }

        const userId = req.data?._id || req.data?.id || req.user?._id || req.user?.id

        const createManager = await User.create({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          phone: String(phone).trim(),
          designation: designation.trim(),
          userId
        })

        const populated = await createManager.populate('userId', 'name email')

        res.status(201).json({
            msg: "manager created successfully",
            CreateManager: populated,
            manager: populated
        })
    } catch (error) {
    next(error);
  }
}

const ReadManager = async (req,res,next) => {
  try{
      const readManager = await User.find().populate('userId', 'name email').sort({ createdAt: -1 })

      res.status(200).json({msg: "read the manager",ReadManager: readManager})
  } catch (error) {
    next(error);
  }
}

const UpdateManager = async (req,res,next) => {
  try{
      const { id } = req.params
      const {name,email,password,phone,designation} = req.body

        const check = await User.findById(id)

        if(!check) {
          return res.status(404).json({ msg: "Manager Not Found" })
        }

        const updateManager = await User.findByIdAndUpdate(
          id,
          {name,email,password,phone,designation},
          {new:true}
        )

        res.status(200).json({msg:"Manager update successfully",UpdateManager:updateManager})
  } catch (error) {
    next(error);
  }
}

const DeleteManager = async (req,res,next) => {
  try{
    const {id} = req.params

    const Check = await User.findById(id)

      if (!Check) {
        return res.status(404).json({ msg: 'Manager not found' })
      }

      const deleteManager = await User.findByIdAndDelete(id)
      res.status(200).json({ msg: "Manager deleted successfully", DeleteManager: deleteManager })
  } catch (error) {
    next(error);
  }
}

module.exports = { CreateManager, ReadManager, UpdateManager, DeleteManager }