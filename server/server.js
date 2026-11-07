require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const client = new MongoClient(process.env.MONGODB_URI);

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.json({
        message: "Server is running"
    });
});

app.listen(9000, () => {
    console.log("Server running on port 9000");
});

// =====================================================
// DATABASE CONNECTION
// =====================================================

let db;
let usersCollection;
let projectsCollection;
let membershipsCollection;
let storiesCollection;

async function connectDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        db = client.db("pa2");

        usersCollection = db.collection("Users");
        projectsCollection = db.collection("Projects");
        membershipsCollection = db.collection("Memberships");
        storiesCollection = db.collection("UserStories");

    } catch (error) {
        console.error("Could not connect to MongoDB");
        console.error(error);
    }
}

connectDatabase();

// =====================================================
// PA2 - SIGNUP
// =====================================================

app.post("/signup", async (req, res) => {
    try {
        const { f_name, l_name, username, password } = req.body;

        if (!f_name || !l_name || !username || !password) {
            return res.status(400).json({
                message: "Required information is missing"
            });
        }

        const existingUser = await usersCollection.findOne({
            username
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists"
            });
        }

        await usersCollection.insertOne({
            f_name,
            l_name,
            username,
            password
        });

        return res.status(201).json({
            message: "User created successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

// =====================================================
// PA2 - LOGIN
// =====================================================

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const user = await usersCollection.findOne({
            username
        });

        if (!user) {
            return res.status(401).json({
                message: "Username does not exist"
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "Incorrect password"
            });
        }

        return res.status(200).json({
            message: "Login successful"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

// =====================================================
// PA3 - GET USERS
// =====================================================

app.get("/users", async (req, res) => {
    try {
        const users = await usersCollection.find({}).toArray();

        res.json(users);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// =====================================================
// PA3 - CREATE PROJECT
// =====================================================

app.post("/projects", async (req, res) => {
    try {
        const {
            name,
            description,
            status,
            project_lead_id
        } = req.body;

        if (!name || !description || !status || !project_lead_id) {
            return res.status(400).json({
                message: "Required information is missing"
            });
        }

        const lead = await usersCollection.findOne({
            _id: new ObjectId(project_lead_id)
        });

        if (!lead) {
            return res.status(404).json({
                message: "Project lead does not exist"
            });
        }

        const projectResult = await projectsCollection.insertOne({
            name,
            description,
            status,
            project_lead_id: new ObjectId(project_lead_id)
        });

        await membershipsCollection.insertOne({
            project_id: projectResult.insertedId,
            user_id: new ObjectId(project_lead_id)
        });

        return res.status(201).json({
            message: "Project created successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

// =====================================================
// PA3 - GET PROJECTS
// =====================================================

app.get("/projects", async (req, res) => {
    try {

        const pipeline = [
            {
                $lookup: {
                    from: "Users",
                    localField: "project_lead_id",
                    foreignField: "_id",
                    as: "lead"
                }
            },
            {
                $unwind: "$lead"
            }
        ];

        const projects = await projectsCollection
            .aggregate(pipeline)
            .toArray();

        res.json(projects);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// =====================================================
// PA3 - GET PROJECT MEMBERS
// =====================================================

app.get("/memberships/:projectId", async (req, res) => {
    try {

        const projectId = new ObjectId(req.params.projectId);

        const pipeline = [
            {
                $match: {
                    project_id: projectId
                }
            },
            {
                $lookup: {
                    from: "Users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            }
        ];

        const members = await membershipsCollection
            .aggregate(pipeline)
            .toArray();

        res.json(members);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// =====================================================
// PA3 - ADD MEMBER
// =====================================================

app.post("/memberships/:projectId", async (req, res) => {
    try {

        const projectId = new ObjectId(req.params.projectId);
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                message: "User ID is required"
            });
        }

        const project = await projectsCollection.findOne({
            _id: projectId
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const user = await usersCollection.findOne({
            _id: new ObjectId(user_id)
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const existing = await membershipsCollection.findOne({
            project_id: projectId,
            user_id: new ObjectId(user_id)
        });

        if (existing) {
            return res.status(409).json({
                message: "User already exists in this project"
            });
        }

        await membershipsCollection.insertOne({
            project_id: projectId,
            user_id: new ObjectId(user_id)
        });

        return res.json({
            message: "User added to project successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// =====================================================
// PA3 - REMOVE MEMBER
// =====================================================

app.delete("/memberships/:projectId/:userId", async (req, res) => {
    try {

        const projectId = new ObjectId(req.params.projectId);
        const userId = new ObjectId(req.params.userId);

        const assignedStory = await storiesCollection.findOne({
            project_id: projectId,
            assigned_user_id: userId
        });

        if (assignedStory) {
            return res.status(400).json({
                message: "Cannot remove member with assigned stories"
            });
        }

        const project = await projectsCollection.findOne({
            _id: projectId
        });

        if (!project) {
            return res.status(404).json({
                message: "Project does not exist"
            });
        }

        if (project.project_lead_id.equals(userId)) {
            return res.status(403).json({
                message: "Cannot remove project lead"
            });
        }

        const result = await membershipsCollection.deleteOne({
            project_id: projectId,
            user_id: userId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Membership not found"
            });
        }

        return res.json({
            message: "User removed from project successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// =====================================================
// PA4 - CREATE STORY
// =====================================================

app.post("/stories", async (req, res) => {
    try {

        const {
            project_id,
            title,
            description,
            priority,
            assigned_user_id
        } = req.body;

        if (!project_id || !title || !description || !priority) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        if (!["High", "Medium", "Low"].includes(priority)) {
            return res.status(400).json({
                message: "Invalid priority"
            });
        }

        const project = await projectsCollection.findOne({
            _id: new ObjectId(project_id)
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (assigned_user_id) {

            const member = await membershipsCollection.findOne({
                project_id: new ObjectId(project_id),
                user_id: new ObjectId(assigned_user_id)
            });

            if (!member) {
                return res.status(400).json({
                    message: "Assigned user must belong to project"
                });
            }
        }

        await storiesCollection.insertOne({
            project_id: new ObjectId(project_id),
            title,
            description,
            priority,
            status: "To Do",
            assigned_user_id: assigned_user_id
                ? new ObjectId(assigned_user_id)
                : null
        });

        res.status(201).json({
            message: "Story created successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// =====================================================
// PA4 - GET STORIES
// =====================================================

app.get("/stories/:projectId", async (req, res) => {
    try {

        const projectId = new ObjectId(req.params.projectId);

        const pipeline = [
            {
                $match: {
                    project_id: projectId
                }
            },
            {
                $lookup: {
                    from: "Users",
                    localField: "assigned_user_id",
                    foreignField: "_id",
                    as: "assignedUser"
                }
            }
        ];

        const stories = await storiesCollection
            .aggregate(pipeline)
            .toArray();

        res.json(stories);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// =====================================================
// PA4 - UPDATE STORY
// =====================================================

app.put("/stories/:storyId", async (req, res) => {
    try {

        const storyId = new ObjectId(req.params.storyId);

        const {
            title,
            description,
            priority,
            status,
            assigned_user_id
        } = req.body;

        const story = await storiesCollection.findOne({
            _id: storyId
        });

        if (!story) {
            return res.status(404).json({
                message: "Story not found"
            });
        }

        if (!["High", "Medium", "Low"].includes(priority)) {
            return res.status(400).json({
                message: "Invalid priority"
            });
        }

        if (!["To Do", "In Progress", "Done"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        if (assigned_user_id) {

            const member = await membershipsCollection.findOne({
                project_id: story.project_id,
                user_id: new ObjectId(assigned_user_id)
            });

            if (!member) {
                return res.status(400).json({
                    message: "Assigned user must belong to project"
                });
            }
        }

        await storiesCollection.updateOne(
            {
                _id: storyId
            },
            {
                $set: {
                    title,
                    description,
                    priority,
                    status,
                    assigned_user_id: assigned_user_id
                        ? new ObjectId(assigned_user_id)
                        : null
                }
            }
        );

        res.json({
            message: "Story updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// =====================================================
// PA4 - DELETE STORY
// =====================================================

app.delete("/stories/:storyId", async (req, res) => {
    try {

        await storiesCollection.deleteOne({
            _id: new ObjectId(req.params.storyId)
        });

        res.json({
            message: "Story deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});