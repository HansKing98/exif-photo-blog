/* eslint-disable max-len */
import upyun from "upyun";
export const runtime = "edge";

const NEXT_PUBLIC_UPYUN_SERVICE_NAME =
  process.env.NEXT_PUBLIC_UPYUN_SERVICE_NAME ?? "";
const UPYUN_OPERATOR_NAME =
  process.env.UPYUN_OPERATOR_NAME ?? "";
const UPYUN_OPERATOR_PASSWORD =
  process.env.UPYUN_OPERATOR_PASSWORD ?? "";

export async function GET(
  _: Request,
  { params }: { params: { method: string; path: string; contentMD5: string } }
) {
  if (true) {
    const getHeaderSignFromService = async (query: any) => {
      const bucket = new upyun.Bucket(
        NEXT_PUBLIC_UPYUN_SERVICE_NAME,
        UPYUN_OPERATOR_NAME,
        UPYUN_OPERATOR_PASSWORD
      );
      const headSign = await upyun.sign.getHeaderSign(
        bucket,
        query.method,
        query.path,
        query.contentMD5
      );
      // debugger;
      return headSign;
    };

    const sign = await getHeaderSignFromService(params);
    return Response.json(sign);
  } else {
    return new Response("Unauthorized request", { status: 401 });
  }
}
