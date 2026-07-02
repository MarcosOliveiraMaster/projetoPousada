export function lerArquivosComoBase64(files: FileList | File[]): Promise<string[]> {
  const lista = Array.from(files)
  return Promise.all(lista.map(file => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })))
}
