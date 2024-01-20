import upyun from "upyun";

const NEXT_PUBLIC_RUNTIME = process.env.NEXT_PUBLIC_RUNTIME ?? "";
const NEXT_PUBLIC_SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "";

// 从环境变量获取 AWS S3 配置信息
const NEXT_PUBLIC_UPYUN_SERVICE_NAME =
  process.env.NEXT_PUBLIC_UPYUN_SERVICE_NAME ?? "";
const NEXT_PUBLIC_UPYUN_HOSTNAME = process.env.NEXT_PUBLIC_UPYUN_HOSTNAME ?? "";
//
// 构建 AWS S3 存储桶的基本 URL
export const AWS_S3_BASE_URL = NEXT_PUBLIC_UPYUN_HOSTNAME
  ? `https://${NEXT_PUBLIC_UPYUN_HOSTNAME}`
  : "";
export const NEXT_PUBLIC_UPYUN_PHOTO_PATH =
  process.env.NEXT_PUBLIC_UPYUN_PHOTO_PATH ?? "";
export const NEXT_PUBLIC_UPYUN_UPLOAD_PATH =
  process.env.NEXT_PUBLIC_UPYUN_UPLOAD_PATH ?? "";

async function getHeaderSign(bucket, method, path, contentMD5 = null) {
  let localHost = `https://${NEXT_PUBLIC_SITE_DOMAIN}`;
  if (NEXT_PUBLIC_RUNTIME === "localhost") {
    localHost = "http://localhost:3000";
  }
  let url = "/api/upyun/sign";
  url = `${url}?method=${method}&path=${path}`;
  if (contentMD5) {
    url = `${url}&contentMD5=${contentMD5}`;
  }

  return fetch(`${localHost}${url}`).then((response) => {
    if (response.status !== 200) {
      console.error("gen header sign faild!");
      return;
    }
    return response.json();
  });
}
// 客户端必须 只传 SERVICE_NAME，下一步从后端获取一次性秘钥
var bucket = new upyun.Bucket(NEXT_PUBLIC_UPYUN_SERVICE_NAME);
// 客户端必须用 后台鉴权后的 getHeaderSign
var upyunClient = new upyun.Client(bucket, {}, getHeaderSign);

// 生成指定长度的随机 ID
const generateBlobId = () => generateNanoid(16);

// 从客户端上传文件到 AWS S3，并返回对象的 URL
export const awsS3UploadFromClient = async (
  file: File | Blob,
  fileName: string,
  extension: string,
  addRandomSuffix?: boolean
) => {
  // 生成新的文件名（key）
  const key = addRandomSuffix
    ? `${fileName}-${generateBlobId()}.${extension}`
    : `${fileName}.${extension}`;

  // debug
  // 含中文上传失败
  // 含 % 失败
  // escape('12azZA!,.;!_=- -/\|][{}{][]').indexOf('%u')
  // var reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g');
  // if (reg.test(fileName)) {
  //   // 不用key的情况下 中文不能上传
  // }

  return await upyunClient
    .putFile(`${NEXT_PUBLIC_UPYUN_UPLOAD_PATH}/${key}`, file)
    .then((res: Boolean) => {
      if (res) {
        return `${AWS_S3_BASE_URL}${NEXT_PUBLIC_UPYUN_UPLOAD_PATH}/${key}`;
      } else {
        console.error("putFile 上传失败，返回值:", res);
      }
    })
    .catch((err) => {
      console.error("putFile 上传失败，返回值:", err);
    });
};

// 在 AWS S3 中执行对象移动操作，并返回新对象的 URL
export const awsS3Move = async (
  fileNameSource: string,
  fileNameDestination: string,
  addRandomSuffix?: boolean
) => {
  // 解析源文件名、扩展名和目标文件名
  const name = fileNameSource.split(".")[0];
  const extension = fileNameSource.split(".")[1];
  const Key = addRandomSuffix
    ? `${name}-${generateBlobId()}.${extension}`
    : fileNameDestination;
  // 使用 CopyObjectCommand 执行对象复制操作
  return upyunClient
    .move(fileNameDestination, fileNameSource)
    .then((res: boolean) => {
      if (res) {
        return `${AWS_S3_BASE_URL}${Key}`;
      } else {
        return false;
      }
    });
};

// hansok // 在 AWS S3 中执行对象列表操作，并返回对象 URL 列表
export const awsS3List = async (Prefix: string) => {
  return upyunClient.listDir(NEXT_PUBLIC_UPYUN_UPLOAD_PATH).then((res) => {
    return res.files.length
      ? res.files.map(
          (file: { name: string; type: string; size: number; time: number }) =>
            `${AWS_S3_BASE_URL}${NEXT_PUBLIC_UPYUN_UPLOAD_PATH}/${encodeURI(
              file.name
            )}`
        )
      : [];
  });
};

// hans ok  // 在 AWS S3 中执行对象删除操作
export const awsS3Delete = async (Key: string) => {
  return upyunClient.deleteFile(`${Key}`);
};
