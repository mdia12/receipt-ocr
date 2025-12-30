import { NextResponse } from "next/server";
import { ImageAnnotatorClient } from '@google-cloud/vision';

export async function GET() {
  const diagnostics: any = {
    env_var_exists: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
    env_var_length: process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64?.length || 0,
  };

  try {
    const credsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
    if (!credsBase64) {
      throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS_BASE64");
    }

    const credsJson = Buffer.from(credsBase64, 'base64').toString('utf-8');
    diagnostics.json_length = credsJson.length;
    
    let credentials;
    try {
        credentials = JSON.parse(credsJson);
        diagnostics.json_parse = "success";
        diagnostics.client_email = credentials.client_email;
        diagnostics.project_id = credentials.project_id;
        diagnostics.private_key_exists = !!credentials.private_key;
        diagnostics.private_key_start = credentials.private_key?.substring(0, 20) + "...";
    } catch (e: any) {
        diagnostics.json_parse = "failed";
        diagnostics.json_error = e.message;
        throw new Error("Failed to parse JSON credentials");
    }

    // Try to instantiate client
    try {
        const client = new ImageAnnotatorClient({ credentials });
        diagnostics.client_instantiation = "success";
        // We don't make a call here to save cost/time, just instantiation checks basic config
    } catch (e: any) {
        diagnostics.client_instantiation = "failed";
        diagnostics.client_error = e.message;
        throw e;
    }

    return NextResponse.json({ status: "ok", diagnostics });

  } catch (error: any) {
    return NextResponse.json({ 
        status: "error", 
        message: error.message,
        diagnostics 
    }, { status: 500 });
  }
}
