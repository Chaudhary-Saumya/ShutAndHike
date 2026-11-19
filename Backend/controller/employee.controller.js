const Employee = require('../models/user.model')
const mongoose = require('mongoose')

const CreateEmployee = async (req,res,next) => {
    try{
        const { name, email, phone, password } = req.body

        if(!name || !email || !password || !phone ) {
            return res.status(400).json({ msg: "all are required" })
        }

        const existingUser = await Employee.findOne({ email });
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'An account with this email address already exists.'
          });
        }

        const createemployee = await Employee.create({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          role: "Employee",
          phone: String(phone).trim(),
        });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',CreateEmployee: createemployee});
    } catch (error) {
    next(error);
  }
}

const GetEmployee = async (req,res,next) => {
    try{
      const reademployee = await Employee.find({ role: "Employee" }).populate('userId', 'name email').sort({ createdAt: -1 })

      res.status(200).json({msg: "read the manager",GetEmployee: reademployee})
    } catch (error) {
    next(error);
  }
}

const GetByIdEmployee = async (req, res,next) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: "Invalid Employee ID format" })
        }

        const foundEmployee = await Employee.findById( id ).populate('userId', 'name email role')
        if (!foundEmployee) {
            return res.status(404).json({ msg: "Employee not found" })
        }

        res.status(200).json({
            msg: "Employee fetched successfully",
            GetByIdEmployee: foundEmployee
        })
    } catch (error) {
    next(error);
  }
}

const UpdateEmployee = async (req,res,next) => {
    try{
        const { id } = req.params
        const { name, email, password, phone } = req.body

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ msg: "Invalid Blog ID format" })
            }

        const currentUserRole = (req.user?.role || req.data?.role || '').toLowerCase();
        const isAllowed = currentUserRole === 'admin' || currentUserRole === 'manager';

        if (!isAllowed) {
            return res.status(403).json({ msg: 'Unauthorized. Only Admin and Manager can update this Employee' });
        }

        const foundEmployee = await Employee.findOne({ _id: id, role: 'Employee' });
        if (!foundEmployee) {
            return res.status(404).json({ msg: 'Employee not found' });
        }


        const updateemployee = await Employee.findByIdAndUpdate(
            id,
            {name, email, password, phone },
            {new:true}).populate('userId', 'name email role')

        res.status(200).json({
        msg: "Employee updated successfully",
        UpdateEmployee: updateemployee
        })
    } catch (error) {
    next(error);
  }
}


const DeleteEmployee = async (req,res,next) => {
    try{
        const { id } = req.params

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ msg: "Invalid Blog ID format" })
            }

        const currentUserRole = (req.user?.role || req.data?.role || '').toLowerCase();
        const isAllowed = currentUserRole === 'admin' || currentUserRole === 'manager';

        if (!isAllowed) {
            return res.status(403).json({ msg: 'Unauthorized. Only Admin and Manager can delete this Employee' });
        }

        const deleteemployee = await Employee.findByIdAndDelete( id )

        res.status(200).json({ msg: "Employee deleted successfully", DeleteEmployee: deleteemployee })        
    } catch (error) {
    next(error);
  }
}

module.exports = { CreateEmployee, GetEmployee , GetByIdEmployee, UpdateEmployee, DeleteEmployee }