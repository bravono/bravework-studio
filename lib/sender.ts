const SENDER_API_KEY = process.env.SENDER_API_KEY;
const SENDER_API_URL = "https://api.sender.net/v2";

export async function getSenderGroups() {
  if (!SENDER_API_KEY) return [];

  try {
    const response = await fetch(`${SENDER_API_URL}/groups`, {
      headers: {
        Authorization: `Bearer ${SENDER_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch sender groups", await response.text());
      return [];
    }

    const data = await response.json();
    return data.data || []; // Assuming standard Laravel-style pagination response structure "data"
  } catch (error) {
    console.error("Error fetching Sender groups:", error);
    return [];
  }
}

export async function createSenderGroup(title: string) {
  if (!SENDER_API_KEY) return null;

  try {
    const response = await fetch(`${SENDER_API_URL}/groups`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDER_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      console.error("Failed to create sender group", await response.text());
      return null;
    }

    const data = await response.json();
    return data.data; // Returning the created group object
  } catch (error) {
    console.error("Error creating Sender group:", error);
    return null;
  }
}

export async function getOrCreateSenderGroup(title: string) {
  const groups = await getSenderGroups();
  const existingGroup = groups.find(
    (g: any) => g.title.toLowerCase() === title.toLowerCase(),
  );

  if (existingGroup) {
    return existingGroup.id;
  }

  const newGroup = await createSenderGroup(title);
  return newGroup ? newGroup.id : null;
}

export async function subscribeToSender(
  email: string,
  name: string,
  groupIds: string[],
) {
  if (!SENDER_API_KEY) return false;

  try {
    const response = await fetch(`${SENDER_API_URL}/subscribers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDER_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        firstname: name.split(" ")[0],
        lastname: name.split(" ").slice(1).join(" "),
        groups: groupIds,
      }),
    });

    if (!response.ok) {
      console.error(
        "Failed to subscribe user to sender",
        await response.text(),
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error subscribing to Sender:", error);
    return false;
  }
}
