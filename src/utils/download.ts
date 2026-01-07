export const download = async (url: string, name) => {
  // 1. 创建一个 a 标签
  const link = document.createElement('a');
  // 2. 设置下载地址
  link.href = url;
  // 3. 设置下载后的文件名（可选）
  // 如果不设置，浏览器会使用 URL 中的文件名
  link.download = name || '';
  // 4. 将标签添加到页面（为了触发点击事件
  document.body.appendChild(link);
  // 5. 模拟点击
  link.click();
  // 6. 下载完成后，移除标签（保持页面干净）
  document.body.removeChild(link);
}
