// export async function sendVerificationRequest({ identifier: email, url: string }: { identifier: string, url: string }) {
export async function sendVerificationRequest({ identifier: email }: { identifier: string }) {
  const rootDomainUrl = process.env.ROOT_DOMAIN_URL || 'https://band.stream';
  const internalApiToken = process.env.INTERNAL_API_TOKEN;

  await fetch(`${rootDomainUrl}/api/mails/send-welcome-mail?internalApiToken=${internalApiToken}&username=${email}&email=${email}`);
}





// import { sendCreateAccountMail } from "@/lib/actions/send-create-account-mail";
 
// export async function sendVerificationRequest(params: { identifier: string, url: string }) {
//   const { identifier, url } = params

//   const result = await sendCreateAccountMail(identifier, identifier, url)

//   if(result.response.status !== 200) {
//     throw new Error(`Email could not be sent: ${result.response.status}`)
//   }
// }