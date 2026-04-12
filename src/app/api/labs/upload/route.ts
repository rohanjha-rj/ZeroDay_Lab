import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    const filename = file.name;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const content = buffer.toString('utf-8');

    // Vulnerability Check: The server looks at MIME type or extension loosely
    const isPhp = /\.php|\.phtml|\.php5|\.phar/i.test(filename) || /\.php|\.phtml|\.php5/i.test(content);
    const hasWebshell = /system\(|exec\(|passthru\(|\$_GET|shell_exec/i.test(content);
    const hasMagicBytes = /GIF89a|^\xFF\xD8\xFF|PNG/i.test(content);
    const isDoubleExt = /\.(php|php5|phtml)\.(jpg|png|gif)/i.test(filename);

    if (!isPhp && !hasWebshell) {
      return NextResponse.json({
        success: false,
        error: true,
        message: 'Only jpg, png, gif files are allowed',
        serverResponse: 'HTTP 400 Bad Request\n{"error":"Invalid file type"}'
      });
    }

    // Exploit successful
    let detail = 'PHP webshell uploaded. Remote code execution achieved.';
    if (hasMagicBytes) detail = 'MIME bypass successful! File passed as valid image but server executed PHP.';
    if (isDoubleExt) detail = 'Double extension bypass worked! Server stripped .jpg and executed as PHP webshell.';

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      detail,
      file: `uploads/${filename}`,
      url: `/uploads/${filename}?cmd=id`,
      output: 'uid=33(www-data) gid=33(www-data) groups=33(www-data)'
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
