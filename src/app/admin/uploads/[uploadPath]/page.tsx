import PhotoForm from '@/photo/PhotoForm';
import AdminChildPage from '@/components/AdminChildPage';
import { PATH_ADMIN, PATH_ADMIN_UPLOADS } from '@/site/paths';
import { extractExifDataFromBlobPath } from '@/photo/server';
import { redirect } from 'next/navigation';

import {
  NEXT_PUBLIC_UPYUN_UPLOAD_PATH,
  AWS_S3_BASE_URL,
} from '@/services/blob/aws-s3';
interface Params {
  params: { uploadPath: string }
}

export default async function UploadPage({ params: { uploadPath } }: Params) {
  const fileName = decodeURIComponent(uploadPath).replace(
    `${AWS_S3_BASE_URL}${NEXT_PUBLIC_UPYUN_UPLOAD_PATH}/`,''
  );

  const {
    blobId,
    photoFormExif,
  } = await extractExifDataFromBlobPath(uploadPath);

  if (!photoFormExif) { redirect(PATH_ADMIN); }

  return (
    <AdminChildPage
      backPath={PATH_ADMIN_UPLOADS}
      backLabel="Uploads"
      breadcrumb={blobId}
    >
      <PhotoForm initialPhotoForm={{ ...photoFormExif, title: fileName }} />
    </AdminChildPage>
  );
};
