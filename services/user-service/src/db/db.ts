import {
    MongoClient,
    Db,
    Collection,
    Document,
    MongoNetworkError,
    MongoNetworkTimeoutError,
} from "mongodb";

import { config } from "../config/index";
import { ECollectionSchema } from "./collectionEnum";
import { logger } from "../utils/logger";

const MONGODB_URI = config.MONGO_URI!;

let mongoClient: MongoClient | null = null;
let isConnected = false;
let connectionTimeout: NodeJS.Timeout | null = null;
const IDLE_TIMEOUT = 60000;
const MAX_POOL_SIZE = 10;


// Create MongoDB client with optimized settings
function createMongoClient() {
    return new MongoClient(MONGODB_URI);
}

// Connect to MongoDB with lazy connection
export async function connectMongoDB() {
    try {
        if (isConnected && mongoClient) {

            resetConnectionTimeout();
            return mongoClient;
        }


        if (!mongoClient) {
            mongoClient = createMongoClient();
        }

        await mongoClient.connect();
        isConnected = true;
        logger.info("Connected to MongoDB");


        resetConnectionTimeout();

        return mongoClient;
    } catch (error) {
        logger.error("Error connecting to MongoDB:", error);
        isConnected = false;
        mongoClient = null;
        throw error;
    }
}

// Reset the connection timeout
function resetConnectionTimeout() {
    if (connectionTimeout) {
        clearTimeout(connectionTimeout);
    }

    connectionTimeout = setTimeout(async () => {
        try {
            if (isConnected && mongoClient) {
                console.info("Closing idle MongoDB connection");
                await mongoClient.close();
                isConnected = false;
                mongoClient = null;
            }
            if (!isConnected) {
                console.info("MongoDB connection closed due to inactivity");
            }
        } catch (error) {
            console.error("Error closing idle MongoDB connection:", error);
        }
    }, IDLE_TIMEOUT);
}


// Close MongoDB connection
export async function closeMongoDB() {
    try {
        if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
        }

        if (isConnected && mongoClient) {
            console.info("Closing MongoDB connection...");
            await mongoClient.close();
            console.info("MongoDB connection closed");
            isConnected = false;
            mongoClient = null;
        }
    } catch (error) {
        console.error("Error closing MongoDB connection:", error);
        throw error;
    }
}

// Handle MongoDB errors with reconnection infoic
export async function mongoErrorHandler(
    error: Error | any,
    message: string,
    message2: string
) {
    if (
        error instanceof MongoNetworkError ||
        error instanceof MongoNetworkTimeoutError
    ) {
        // Try to reconnect
        isConnected = false;
        await connectMongoDB().then(() => {
            console.error(message, error);
        });
    } else {
        console.error(message2, error, error.stack);
    }
}


// Get collection with auto-connect
export async function getCollection<T extends Document>(
    collectionName: ECollectionSchema,
    dbname: string | undefined | null
): Promise<Collection<T>> {
    // Ensure connection is active
    if (!isConnected || !mongoClient) {
        await connectMongoDB();
    }

    // Reset timeout since we're using the connection
    resetConnectionTimeout();

    // Get database and collection
    if (!mongoClient) throw new Error("MongoDB client is not initialized");
    const db: Db = mongoClient.db(getDbName(dbname));
    return db.collection<T>(collectionName);
}


export function getDbName(dbname: string | undefined | null) {

    if (dbname == null || dbname === "null" || dbname === "undefined" || !dbname) {
        return "socail_db"; // default database name (global)
    }

    else {
        return dbname + "_db"; // concatenate the provided name with "_db"
    }
}

