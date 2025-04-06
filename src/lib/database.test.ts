import { expect, test } from "vitest";
import { getDatabase, type NewUserData } from "./database";
import { v4 as uuidv4 } from "uuid";
import type { User } from "./tracker";

/**
 * Vitest browser remembers already created databases on repeated runs, so we
 * use a new database on every test to keep them isolated.
 *
 * Created databases are NOT remembered if we re-run the test script again.
 */
async function getFreshDatabase() {
	return await getDatabase(`testDB-${uuidv4()}`);
}

test("store user data in database", async () => {
	const user1: NewUserData = { username: "Dylan G.", paidBreakDuration: 45 };
	const user2: NewUserData = { username: "Irving B.", paidBreakDuration: 50 };
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
	const user1: NewUserData = { username: "Helly R.", paidBreakDuration: 45 };
	const user2: NewUserData = { username: "Helly R.", paidBreakDuration: 50 };

	const db = await getFreshDatabase();

	expect(await db.insertUser(user1)).not.toBeFalsy();
	expect(await db.insertUser(user2)).toStrictEqual(false);
});

test("getAllUsers should return all users in the database", async () => {
	const user1: NewUserData = { username: "Mark S.", paidBreakDuration: 45 };
	const user2: NewUserData = { username: "Helly R.", paidBreakDuration: 50 };

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
	const userToInsert: NewUserData = {
		username: "Mark S.",
		paidBreakDuration: 45,
	};
	const db = await getFreshDatabase();
	const userId = await db.insertUser(userToInsert);

	const user = await db.getUserById(userId);

	expect(typeof user?.id).toEqual("string");
	expect(user?.id).toHaveLength(36);
	expect(user?.settings.username).toEqual("Mark S.");
	expect(user?.settings.paidBreakDuration).toEqual(45);
	expect(user?.trackingData).toEqual({ workdays: [] });
});

test("update existing user in database", async () => {
	const db = await getFreshDatabase();
	const userToInsert: NewUserData = {
		username: "Gemma S.",
		paidBreakDuration: 30,
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
		},
	];

	expect(await db.updateUser(user)).toStrictEqual(true);

	const updatedUser = (await db.getUserById(userId)) as User;
	expect(updatedUser).toEqual(user);
});

function byBreakDuration(a: User, b: User) {
	return a.settings.paidBreakDuration - b.settings.paidBreakDuration;
}
