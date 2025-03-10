import { Sequelize, DataTypes, Model } from "sequelize"

// Initialize Sequelize with MySQL
const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST || "localhost",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "auth_system",
  logging: false,
})

// Define User model
class User extends Model {
  declare id: string
  declare firstName: string
  declare lastName: string
  declare email: string
  declare password: string
  declare dateOfBirth: Date
  declare phone: string
  declare isVerified: boolean
  declare verificationToken: string | null
  declare verificationTokenExpiry: Date | null
  declare resetToken: string | null
  declare resetTokenExpiry: Date | null
  declare createdAt: Date
  declare updatedAt: Date
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verificationTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
  },
)

// Define Address model
class Address extends Model {
  declare id: string
  declare userId: string
  declare street: string
  declare town: string
  declare state: string
  declare country: string
  declare zipCode: string
  declare createdAt: Date
  declare updatedAt: Date
}

Address.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    town: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Address",
    tableName: "addresses",
  },
)

// Define relationships
User.hasOne(Address, { foreignKey: "userId", as: "address" })
Address.belongsTo(User, { foreignKey: "userId" })

// Initialize database
const initDb = async () => {
  try {
    await sequelize.authenticate()
    console.log("Database connection established successfully")

    // Sync models with database
    // In production, you would use migrations instead
    await sequelize.sync({ alter: true })
    console.log("Database models synchronized")
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
}

// Export models and database utilities
export const db = {
  sequelize,
  User,
  Address,
  initDb,
}

