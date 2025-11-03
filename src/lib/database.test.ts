import { expect, test } from "vitest";
import { getDatabase, type NewUserSettings } from "./database";
import { v4 as uuidv4 } from "uuid";
import { type User, type Workday } from "./tracker";

/**
 * Vitest browser remembers already created databases on repeated runs, so we
 * use a new database on every test to keep them isolated.
 *
 * Created databases are NOT remembered if we re-run the test script again.
 */
async function getFreshDatabase(version = 2) {
	return await getDatabase(`testDB-${uuidv4()}`, version);
}

async function getExistingDatabase(name: string, version = 2) {
	return await getDatabase(name, version);
}

test("store user data in database", async () => {
	const user1: NewUserSettings = {
		username: "Dylan G.",
		paidBreakDuration: 45,
		workdayLength: 8,
	};
	const user2: NewUserSettings = {
		username: "Irving B.",
		paidBreakDuration: 50,
		workdayLength: 6,
	};
	const db = await getFreshDatabase();

	const firstUserInsertResult = await db.insertUser(user1);
	expect(typeof firstUserInsertResult).toEqual("string");
	expect(firstUserInsertResult).toHaveLength(36);
	expect(await db.getUserCount()).toEqual(1);

	const secondUserInsertResult = await db.insertUser(user2);
	expect(typeof secondUserInsertResult).toEqual("string");
	expect(secondUserInsertResult).toHaveLength(36);
	expect(await db.getUserCount()).toEqual(2);
});

test("storing two users with the same username should fail", async () => {
	const user1: NewUserSettings = {
		username: "Helly R.",
		paidBreakDuration: 45,
		workdayLength: 8,
	};
	const user2: NewUserSettings = {
		username: "Helly R.",
		paidBreakDuration: 50,
		workdayLength: 8.5,
	};

	const db = await getFreshDatabase();

	expect(await db.insertUser(user1)).not.toBeFalsy();
	expect(await db.insertUser(user2)).toStrictEqual(false);
});

test("getAllUsers should return all users in the database", async () => {
	const user1: NewUserSettings = {
		username: "Mark S.",
		paidBreakDuration: 45,
		workdayLength: 6,
	};
	const user2: NewUserSettings = {
		username: "Helly R.",
		paidBreakDuration: 50,
		workdayLength: 6.5,
	};

	const db = await getFreshDatabase();

	expect(await db.insertUser(user1)).not.toBeFalsy();
	expect(await db.getAllUsers()).toHaveLength(1);
	expect((await db.getAllUsers())[0].id).not.toBeFalsy();
	expect(await db.insertUser(user2)).not.toBeFalsy();
	const twoUsers = (await db.getAllUsers()).sort(byBreakDuration);
	expect(twoUsers).toHaveLength(2);
	expect(twoUsers[0].id).not.toBeFalsy();
	expect(twoUsers[1].id).not.toBeFalsy();
	expect(twoUsers[0].settings.paidBreakDuration).toEqual(45);
	expect(twoUsers[1].settings.paidBreakDuration).toEqual(50);
	expect(twoUsers[0].settings.workdayLength).toEqual(6);
	expect(twoUsers[1].settings.workdayLength).toEqual(6.5);
	expect(twoUsers[0].settings.username).toEqual("Mark S.");
	expect(twoUsers[1].settings.username).toEqual("Helly R.");
	expect(twoUsers[0].trackingData).toEqual({ workdays: [] });
	expect(twoUsers[1].trackingData).toEqual({ workdays: [] });
});

test("getUserById should return null if no user found for given id", async () => {
	const db = await getFreshDatabase();
	expect(await db.getUserById(false)).toBeNull();
	expect(
		await db.getUserById("9a1c79ca-b8cb-4ea1-96f9-9ae22578f6e6"),
	).toBeNull();
});

test("getUserById should return a user", async () => {
	const userToInsert: NewUserSettings = {
		username: "Mark S.",
		paidBreakDuration: 45,
		workdayLength: 7,
	};
	const db = await getFreshDatabase();
	const userId = await db.insertUser(userToInsert);

	const user = await db.getUserById(userId);

	expect(typeof user?.id).toEqual("string");
	expect(user?.id).toHaveLength(36);
	expect(user?.settings.username).toEqual("Mark S.");
	expect(user?.settings.paidBreakDuration).toEqual(45);
	expect(user?.settings.workdayLength).toEqual(7);
	expect(user?.trackingData).toEqual({ workdays: [] });
});

test("update existing user in database", async () => {
	const db = await getFreshDatabase();
	const userToInsert: NewUserSettings = {
		username: "Gemma S.",
		paidBreakDuration: 30,
		workdayLength: 8,
	};
	const userId = await db.insertUser(userToInsert);
	const user = (await db.getUserById(userId)) as User;
	user.trackingData.workdays = [
		{
			events: [
				{ type: "start-workday", time: new Date(2025, 2, 2, 8, 15, 0) },
				{ type: "start-break", time: new Date(2025, 2, 2, 11, 15, 0) },
			],
			paidBreakDuration: 30,
			workdayLength: 8,
		},
	];

	expect(await db.updateUser(user)).toStrictEqual(true);

	const updatedUser = (await db.getUserById(userId)) as User;
	expect(updatedUser).toEqual(user);
});

test("upgrading database to version 2", async () => {
	// @ts-expect-error Insert user with version 1 of the data (no paidBreakDuration and workdayLength info)
	// into the database.
	const userToInsert: NewUserSettings = {
		username: "Mark S.",
	};
	const oldDatabase = await getFreshDatabase(1);
	const userId = await oldDatabase.insertUser(userToInsert);
	const oldUser = (await oldDatabase.getUserById(userId)) as User;
	oldUser.trackingData = {
		workdays: [
			{
				events: [
					{
						time: new Date("2025-11-03T20:05:53.626Z"),
						type: "start-workday",
					},
					{
						time: new Date("2025-11-03T21:05:53.626Z"),
						type: "end-workday",
					},
				],
			} as Workday,
			// Specifically no paidBreakDuration and workdayLength.
		],
	};
	oldDatabase.updateUser(oldUser);
	oldDatabase.close();
	// Open the database with version 2.
	const newDatabase = await getExistingDatabase(oldDatabase.name, 2);

	const user = await newDatabase.getUserById(userId);

	// Old data should be automatically migrated.
	expect(typeof user?.id).toEqual("string");
	expect(user?.id).toHaveLength(36);
	expect(user?.settings.username).toEqual("Mark S.");
	expect(user?.settings.paidBreakDuration).toEqual(45);
	expect(user?.settings.workdayLength).toEqual(8);
	expect(user?.trackingData).toEqual({
		workdays: [
			{
				events: [
					{
						time: new Date("2025-11-03T20:05:53.626Z"),
						type: "start-workday",
					},
					{
						time: new Date("2025-11-03T21:05:53.626Z"),
						type: "end-workday",
					},
				],
				paidBreakDuration: 45,
				workdayLength: 8,
			},
		],
	});
});

function byBreakDuration(a: User, b: User) {
	return a.settings.paidBreakDuration - b.settings.paidBreakDuration;
}
