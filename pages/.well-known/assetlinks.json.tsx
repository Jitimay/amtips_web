import { GetServerSideProps } from 'next';

// Serves /.well-known/assetlinks.json for Android App Links verification.
// Replace REPLACE_WITH_YOUR_RELEASE_SHA256_FINGERPRINT with your actual keystore SHA256.
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const json = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'app.amtips',
        sha256_cert_fingerprints: [
          'B0:3F:CA:3D:6C:08:8D:3B:DD:EA:B6:D3:EC:69:69:38:E1:68:06:8B:04:29:2D:3C:0F:99:55:6F:3D:55:31:C1',
        ],
      },
    },
  ];
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(json));
  res.end();
  return { props: {} };
};

export default function AssetLinks() { return null; }
