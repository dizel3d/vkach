package {
	import flash.display.Sprite;
	import flash.external.ExternalInterface;
	import flash.net.FileReference;
	import flash.net.URLRequest;
	import flash.system.Security;
	import flash.events.MouseEvent;
	import flash.display.SimpleButton;
	import flash.display.Shape;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;

	public class Main extends Sprite {
		private var obj:Object = null;

		public function Main() {
			Security.allowDomain("*");
			if (ExternalInterface.available) {
				ExternalInterface.addCallback("ext_download", download);
			}

			var buttonArea:Shape = new Shape();
			buttonArea.graphics.beginFill(0);
		    buttonArea.graphics.drawRect(0, 0, 500, 500);
		    buttonArea.graphics.endFill();

			var button:SimpleButton = new SimpleButton();
			button.hitTestState = buttonArea;
			button.hitTestState.x = 0;
			button.hitTestState.y = 0;
			button.addEventListener(MouseEvent.MOUSE_UP, mouseUpHandler);

			this.addChild(button);
			stage.align = StageAlign.TOP_LEFT;
			stage.scaleMode = StageScaleMode.NO_SCALE;
		}

		private function download(url:String, defaultFileName:String = null):void {
			trace("download");
			this.obj = {url: url, defaultFileName: defaultFileName};
		}

        private function mouseUpHandler(event:MouseEvent):void {
			trace("MouseUp! (!!this.obj) = " + !!this.obj);
			if (!this.obj) {
				return;
			}
			var request:URLRequest = new URLRequest();
			request.url = this.obj.url;
			var file:FileReference = new FileReference();
			file.download(request, this.obj.defaultFileName);
			this.obj = null;
        }
	}
}

