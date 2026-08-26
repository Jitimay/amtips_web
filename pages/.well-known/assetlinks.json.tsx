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
          'REPLACE_WITH_YOUR_RELEASE_SHA256_FINGERPRINT',
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
