import { v4 as uuidv4 } from "uuid";
import type { Settings, User } from "./tracker";

/**
 * Used to access local database data.
 */
interface Database {
	insertUser(user: NewUserData): Promise<string | false>;
	updateUser(user: User): Promise<boolean>;
	getUserById(userId: string | false): Promise<User | null>;
	getAllUsers(): Promise<User[]>;
	getUserCount(): Promise<number>;
}

export type NewUserData = Settings;

export function getDatabase(name = "work-hours-tracker-db"): Promise<Database> {
	let db: IDBDatabase;

	return new Promise((resolve, reject) => {
		const request = window.indexedDB.open(name, 1);

		request.onerror = (event) => {
			console.error("Error while opening database", event);
			reject(event);
		};

		request.onsuccess = () => {
			db = request.result;
			db.addEventListener("error", (event) => {
				console.error("Database error occurred", event);
			});

			resolve({
				async insertUser(userSettings) {
					const transaction = db.transaction(["users"], "readwrite");
					const usersTable = transaction.objectStore("users");
					const userId = uuidv4();
					usersTable.add({
						id: userId,
						settings: userSettings,
						trackingData: { workdays: [] },
					});

					return new Promise((resolve) => {
						transaction.addEventListener("complete", () => {
							resolve(userId);
						});
						transaction.addEventListener("error", () => {
							resolve(false);
						});
					});
				},
				async updateUser(user) {
					const transaction = db.transaction(["users"], "readwrite");
					const usersTable = transaction.objectStore("users");

					usersTable.put(user);

					return new Promise((resolve) => {
						transaction.addEventListener("complete", () => {
							resolve(true);
						});
						transaction.addEventListener("error", () => {
							resolve(false);
						});
					});
				},
				async getUserById(userId: string | false): Promise<User | null> {
					return new Promise((resolve) => {
						const userRequest = db
							.transaction(["users"], "readonly")
							.objectStore("users")
							.get(userId || "");

						userRequest?.addEventListener("success", () => {
							resolve(userRequest.result || null);
						});
					});

					return null;
				},
				async getAllUsers() {
					const usersRequest = db
						.transaction(["users"], "readonly")
						.objectStore("users")
						.getAll();

					return new Promise((resolve) => {
						usersRequest.addEventListener("success", () => {
							resolve(usersRequest.result);
						});
					});
				},
				async getUserCount() {
					const usersCountRequest = db
						.transaction(["users"], "readonly")
						.objectStore("users")
						.count();

					return new Promise((resolve) => {
						usersCountRequest.addEventListener("success", () => {
							resolve(usersCountRequest.result);
						});
					});
				},
			});
		};

		request.addEventListener("upgradeneeded", (init) => {
			const db = (init.target as IDBOpenDBRequest).result as IDBDatabase;
			const workdaysTable = db.createObjectStore("workdays", { keyPath: "id" });
			workdaysTable.createIndex("date", "date", { unique: true });
			const usersTable = db.createObjectStore("users", { keyPath: "id" });
			usersTable.createIndex("settings.username", "settings.username", {
				unique: true,
			});
		});
	});
}
