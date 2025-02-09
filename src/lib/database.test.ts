import { expect, test } from "vitest";
import { getDatabase, type NewUserData } from "./database";
import { v4 as uuidv4 } from "uuid";
import type { UserSettings } from "./tracker";

/**
 * Vitest browser remembers already created databases on repeated runs, so we
 * use a new database on every test to keep them isolated.
 *
 * Created databases are NOT remembered if we run `npm t` again.
 */
async function getFreshDatabase() {
	return await getDatabase(`testDB-${uuidv4()}`);
}

test("store user data in database", async () => {
	const user1: NewUserData = { username: "Dylan G.", paidBreakDuration: 45 };
	const user2: NewUserData = { username: "Irving B.", paidBreakDuration: 50 };
	// Use a different database for each test.
	const db = await getFreshDatabase();

	expect(await db.insertUser(user1)).toStrictEqual(true);
	expect(await db.getUserCount()).toEqual(1);
	expect(await db.insertUser(user2)).toStrictEqual(true);
	expect(await db.getUserCount()).toEqual(2);
});

test("storing two users with the same username should fail", async () => {
	const user1: NewUserData = { username: "Helly R.", paidBreakDuration: 45 };
	const user2: NewUserData = { username: "Helly R.", paidBreakDuration: 50 };

	const db = await getFreshDatabase();

	expect(await db.insertUser(user1)).toStrictEqual(true);
	expect(await db.insertUser(user2)).toStrictEqual(false);
});

test("getAllUsers should return all users in the database", async () => {
	const user1: NewUserData = { username: "Mark S.", paidBreakDuration: 45 };
	const user2: NewUserData = { username: "Helly R.", paidBreakDuration: 50 };

	const db = await getFreshDatabase();

	expect(await db.insertUser(user1)).toStrictEqual(true);
	expect(await db.getAllUsers()).toHaveLength(1);
	expect((await db.getAllUsers())[0].id).not.toBeFalsy();
	expect(await db.insertUser(user2)).toStrictEqual(true);
	const twoUsers = (await db.getAllUsers()).sort(byBreakDuration);
	expect(twoUsers).toHaveLength(2);
	expect(twoUsers[0].id).not.toBeFalsy();
	expect(twoUsers[1].id).not.toBeFalsy();
	expect(twoUsers[0].paidBreakDuration).toEqual(45);
	expect(twoUsers[1].paidBreakDuration).toEqual(50);
	expect(twoUsers[0].username).toEqual("Mark S.");
	expect(twoUsers[1].username).toEqual("Helly R.");
});

function byBreakDuration(a: UserSettings, b: UserSettings) {
	return a.paidBreakDuration - b.paidBreakDuration;
}
