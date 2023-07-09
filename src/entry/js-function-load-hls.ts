import { loadHls } from '@/scripts/hls'
import { uCoastWindow } from '@/scripts/setup'
declare let window: uCoastWindow
window.loadHls = () => {
  void loadHls()
}
window.loadHls()
