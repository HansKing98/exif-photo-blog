export const runtime = 'edge';

export async function GET(
  _: Request,
  { params: { key } }: { params: { key: string } }
) {
  if (true) {
    return new Response('/api/upyun', {
      headers: { 'content-type': 'text/plain' },
    });
  } else {
    return new Response('Unauthorized request', { status: 401 });
  }
}
