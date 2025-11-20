export interface IEmailAttachment {
  filename: string;
  path?: string;
  cid?: string;
}

export interface IEmailTemplate {
  email: string;
  subject: string;
  html: string;
  attachments?: IEmailAttachment[];
}

export default interface IEmailData {
  email: string; // recipient email address
  subject: string;
  html: string;
  attachments?: IEmailAttachment[];
}
