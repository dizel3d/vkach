package {
	import flash.display.Sprite;
	import flash.external.ExternalInterface;
	import flash.net.FileReference;
	import flash.net.URLRequest;

	public class Main extends Sprite {
		public function Main() {
			if (ExternalInterface.available) {
				ExternalInterface.addCallback("download", download);
			}
		}

		private function download(url:String, defaultFileName:String = null):void {
			var request:URLRequest = new URLRequest();
			request.url = url;
			var file:FileReference = new FileReference();
			file.download(request, defaultFileName);
		}
	}
}

