export interface DocumentRenderer {
  render(templateName: string, data: any, language: string): Promise<Buffer>;
}
