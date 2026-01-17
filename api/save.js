import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS 设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET 请求返回使用说明
  if (req.method === 'GET') {
    return res.status(200).json({
      service: 'HTML Hosting Service',
      usage: 'POST html content to this endpoint',
      status: 'running'
    });
  }

  // 只接受 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // 获取 HTML 内容
    let htmlContent = req.body;
    
    // 如果是 JSON 格式，提取 html 字段
    if (typeof htmlContent === 'object') {
      htmlContent = htmlContent.html || htmlContent.content || JSON.stringify(htmlContent);
    }
    
    // 确保是字符串
    if (typeof htmlContent !== 'string') {
      htmlContent = String(htmlContent);
    }

    if (!htmlContent || htmlContent.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'No HTML content provided'
      });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `ppt/${timestamp}-${randomStr}.html`;

    // 上传到 Vercel Blob
    const blob = await put(filename, htmlContent, {
      access: 'public',
      contentType: 'text/html; charset=utf-8',
    });

    // 返回结果
    return res.status(200).json({
      success: true,
      url: blob.url,
      filename: filename,
      size: blob.size,
      createdAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
