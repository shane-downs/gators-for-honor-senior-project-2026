// log the user out

import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/session";


export async function POST(_request: NextRequest) {
    await destroySession();
    return NextResponse.json({ success: true });
}