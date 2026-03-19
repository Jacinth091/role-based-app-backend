const { departments } = require('../data.js');


const getDepartmentList = async (req, res) => {
    try {
        const departmentList = departments;

        if (departmentList.length <= 0) {
            return res.status(401).json({
                success: false,
                data: departmentList,
                error: "No department stored in the database."
            })
        }

        return res.status(200).json({
            success: true,
            message: "Fetched Departmen List Successfully.",
            data: departmentList
        })
    } catch (error) {
        console.error("Internal Server Error! : ", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}

const getDepartmentById = async (req, res) => {
    const { id } = req.params;
    try {
        const department = departments.find((d) => d.id === Number(id));

        if (!department) {
            return res.status(404).json({
                success: false,
                error: "No department found!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Department Successfully fetched! ",
            data: department
        })

    } catch (error) {
        console.error("Internal Server Error!", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}

module.exports = { getDepartmentList, getDepartmentById };