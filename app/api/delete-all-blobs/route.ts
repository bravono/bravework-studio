import { NextResponse } from "next/server";
import { list, del } from "@vercel/blob";

export async function POST() {
  try {
    // List all blobs in your storage
    const blobs = await list();

    // Delete each blob
    for (const blob of blobs.blobs) {
      await del(blob.url);
    }

    return NextResponse.json({ success: true, deleted: blobs.blobs.length });
  } catch (error: any) {
    console.error("Error deleting all blobs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// try {
//       const response = await fetch("/api/delete-all-blobs", {
//         method: "POST",
//       });
//       console.log("Response from delete-all-blobs:", response);
//       if (response.ok) {
//         toast(`All files deleted successfully!`);
//       } else {
//         const errorData = await response.json();
//         toast(`Error deleting previous files: ${errorData.error || "Failed"}`);
//       }
//     } catch (error) {
//       toast(`Error deleting previous files: ${error.message}`);
//     }
