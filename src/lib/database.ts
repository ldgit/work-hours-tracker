import { v4 as uuidv4 } from "uuid";
import { openDB, unwrap } from "idb";
import type { Settings, User } from "./tracker";

/**
 * Used to access local database data.
 */
interface Database {
	name: string;
	insertUser(user: NewUserSettings): Promise<string | false>;
	updateUser(user: User): Promise<boolean>;
	getUserById(userId: string | false): Promise<User | null>;
	getAllUsers(): Promise<User[]>;
	getUserCount(): Promise<number>;
	close(): void;
}

export type NewUserSettings = Settings;

/**
 * Catches extra error that is thrown if inserting an object with same unique property.
 *
 * @see https://github.com/jakearchibald/idb/issues/256#issuecomment-1048551626
 */
function preventTransactionCloseOnError(promise: Promise<unknown>) {
	const request = unwrap(promise);
	request.addEventListener("error", (event) => {
		event.preventDefault();
		event.stopPropagation();
	});

	return promise;
}

export async function getDatabase(
	name = "work-hours-tracker-db",
	version = 2,
): Promise<Database> {
	const indexedDatabase = await openDB(name, version, {
		async upgrade(db, oldVersion, newVersion, transaction) {
			/**
			 * Recommended pattern for version upgrades.
			 *
			 * @see https://stackoverflow.com/a/44007456
			 */
			if (oldVersion < 1) {
				// Create initial schema.
				const workdaysTable = db.createObjectStore("workdays", {
					keyPath: "id",
				});
				workdaysTable.createIndex("date", "date", { unique: true });
				const usersTable = db.createObjectStore("users", { keyPath: "id" });
				usersTable.createIndex("settings.username", "settings.username", {
					unique: true,
				});
			}

			if (oldVersion < 2) {
				// Migrate data to v2: add workdayLength and paidBreakDuration to user settings and workdays.
				const usersRequest = transaction.objectStore("users");
				const users = await usersRequest.getAll();
				users.forEach(async (user: User) => {
					user.settings.paidBreakDuration = 45;
					user.settings.workdayLength = 8;

					user.trackingData.workdays = user.trackingData.workdays.map(
						(workday) => {
							return { ...workday, paidBreakDuration: 45, workdayLength: 8 };
						},
					);

					await usersRequest.put(user);
				});
			}
		},
		blocked() {
			console.error(
				"Database creation blocked! Please close all other tabs with this site open!",
			);
		},
		terminated() {
			console.warn("Database closed");
		},
	});

	const workHoursDb: Database = {
		name: indexedDatabase.name,
		async insertUser(userSettings) {
			const transaction = indexedDatabase.transaction(["users"], "readwrite");
			const usersTable = transaction.objectStore("users");
			const userId = uuidv4();

			let result;
			try {
				[, result] = await Promise.all([
					transaction.done,
					preventTransactionCloseOnError(
						usersTable.add({
							id: userId,
							settings: userSettings,
							trackingData: { workdays: [] },
						}),
					),
				]);
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (e) {
				return false;
			}

			return result ? userId : false;
		},
		async updateUser(user) {
			const transaction = indexedDatabase.transaction(["users"], "readwrite");
			const usersTable = transaction.objectStore("users");

			return Boolean(await usersTable.put(user));
		},
		async getUserById(userId: string | false): Promise<User | null> {
			const userRequest = indexedDatabase
				.transaction(["users"], "readonly")
				.objectStore("users");

			return (await userRequest.get(userId || "")) || null;
		},
		async getAllUsers() {
			const usersRequest = indexedDatabase
				.transaction(["users"], "readonly")
				.objectStore("users");

			return await usersRequest.getAll();
		},
		async getUserCount() {
			const usersCountRequest = indexedDatabase
				.transaction(["users"], "readonly")
				.objectStore("users");

			return await usersCountRequest.count();
		},
		close() {
			indexedDatabase.close();
		},
	};

	return workHoursDb;
}
