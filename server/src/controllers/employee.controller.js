
const { employees, departments, accounts } = require("../data.js");
const { charactersOnly } = require("../utils/utils.js");



const getEmployeeList = async (req, res) => {
    try {
        const employeeList = employees;

        if (employeeList.length <= 0) {
            return res.status(401).json({
                success: false,
                data: employeeList,
                error: "No employees in the database."
            })
        }

        return res.status(200).json({
            success: true,
            message: "Fetched Employee List Successfully.",
            data: employeeList
        })
    } catch (error) {
        console.error("Internal Server Error! : ", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}


const getEmployeeById = async (req, res) => {
    const { id } = req.params;
    try {
        const employee = employees.find((d) => d.id === Number(id));

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "No employee found!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "employee Successfully fetched! ",
            data: employee
        })

    } catch (error) {
        console.error("Internal Server Error!", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}

const addNewEmployee = async (req, res) => {
    const { email, position, department_id, hire_date } = req.body;
    console.log("Add New Employee Req Body: ", req.body);
    try {
        if (!email?.trim()) {
            return res.status(400).json({ message: "Email should not be empty." });
        }

        if (!position?.trim()) {
            return res.status(400).json({ message: "Position should not be empty." });
        }
        if (!department_id || !department_id.toString().trim()) {
            return res.status(400).json({ message: "Please select a department." });
        }

        if (!hire_date?.trim()) {
            return res.status(400).json({ message: "Please enter a hire date." });
        }

        if (!charactersOnly(position.trim())) {
            return res.status(400).json({ message: "Position contains numerical characters." });
        }

        const hireDate = new Date(hire_date);
        if (isNaN(hireDate.getTime())) {
            return res.status(400).json({ message: "Please enter a valid hire date." });
        }

        const todayDateStr = new Date().toLocaleDateString("en-CA");
        if (hire_date > todayDateStr) {
            return res.status(400).json({ message: "Hire date cannot be in the future." });
        }

        const user = accounts.find((u) => u.email === email);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const department = departments.find((d) => d.id === Number(department_id));
        if (!department) {
            return res.status(404).json({ message: "Department not found!" });
        }
        const empIdCount =
            employees.length === 0 ? 1 : employees[employees.length - 1].id + 1;

        const newEmployee = {
            id: empIdCount,
            user_id: user.id,
            department_id: department.id,
            position: position.trim(),
            hire_date: hire_date,
        };

        employees.push(newEmployee);

        return res.status(200).json({
            success: true,
            message: "Employee added successfully!",
            data: newEmployee,
        });


    } catch (error) {
        console.error("An error occurred: ", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}



const editEmployee = async (req, res) => {
    const { id } = req.params;
    const { email, position, department_id, hire_date } = req.body;
    try {

        const employee = employees.find((e) => e.id === Number(id));
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "Employee not found!"
            })
        }
        if (email) {
            const account = accounts.find((a) => a.email === email.trim());
            if (!account) {
                return res.status(404).json({ success: false, error: "No account found with that email." });
            }
            const duplicate = employees.find((e) => e.user_id === account.id && e.id !== Number(id));
            if (duplicate) {
                return res.status(400).json({ success: false, error: "This account is already assigned to another employee." });
            }

            employee.user_id = account.id;
        }
        if (position) employee.position = position;
        if (department_id) employee.department_id = department_id;
        if (hire_date) employee.hire_date = hire_date;

        return res.status(200).json({ success: true, message: "Employee Updated Successfully!", data: employee });
    } catch (error) {
        console.error("Edit Employee Error: ", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = employees.find((e) => e.id === Number(id));
        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "Employee not found!"
            })
        }
        employees.splice(employees.indexOf(employee), 1);
        return res.status(200).json({ success: true, message: "Employee Deleted Successfully!", data: employee });
    } catch (error) {
        console.error("Delete Employee Error: ", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { getEmployeeList, getEmployeeById, addNewEmployee, editEmployee, deleteEmployee };