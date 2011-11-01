package {
	import flash.display.Sprite;
	import flash.external.ExternalInterface;
	import flash.net.FileReference;
	import flash.net.URLRequest;
	import flash.system.Security;
	import flash.events.*;
	import flash.display.SimpleButton;
	import flash.display.Shape;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;

	public class Main extends Sprite {
		private var obj:Object = null;
		private var file:FileReference = new FileReference();
		private var request:URLRequest;
		private var filename:String;

		public function Main() {
			Security.allowDomain("*");
			if (ExternalInterface.available) {
				ExternalInterface.addCallback("ext_download", download);
			}

			var buttonArea:Shape = new Shape();
			buttonArea.graphics.beginFill(0);
		    buttonArea.graphics.drawRect(0, 0, 100, 100);
		    buttonArea.graphics.endFill();

			var button:SimpleButton = new SimpleButton();
			button.hitTestState = buttonArea;
			button.hitTestState.x = 0;
			button.hitTestState.y = 0;
			button.addEventListener(MouseEvent.MOUSE_UP, mouseUpHandler);

			this.addChild(button);
			stage.align = StageAlign.TOP_LEFT;
			stage.scaleMode = StageScaleMode.NO_SCALE;

			configureListeners(file);
		}

        private function configureListeners(dispatcher:IEventDispatcher):void {
            dispatcher.addEventListener(Event.CANCEL, cancelHandler);
            dispatcher.addEventListener(Event.COMPLETE, completeHandler);
            dispatcher.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
            dispatcher.addEventListener(Event.OPEN, openHandler);
            dispatcher.addEventListener(ProgressEvent.PROGRESS, progressHandler);
            dispatcher.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
            dispatcher.addEventListener(Event.SELECT, selectHandler);
        }

		private function cancelHandler(event:Event):void {
            trace("cancelHandler: " + event);
        }

        private function completeHandler(event:Event):void {
            trace("completeHandler: " + event);
			var file:FileReference = FileReference(event.target);
			ExternalInterface.call("alert", "Vkach: файл \"" + file.name + "\" загружен");
        }

        private function ioErrorHandler(event:IOErrorEvent):void {
            trace("ioErrorHandler: " + event);
			var file:FileReference = FileReference(event.target);
			ExternalInterface.call("alert", "Vkach: ошибка загрузки файла \"" + file.name + "\"");
        }

        private function openHandler(event:Event):void {
            trace("openHandler: " + event);
        }

        private function progressHandler(event:ProgressEvent):void {
            var file:FileReference = FileReference(event.target);
            trace("progressHandler name=" + file.name + " bytesLoaded=" + event.bytesLoaded + " bytesTotal=" + event.bytesTotal);
        }

        private function securityErrorHandler(event:SecurityErrorEvent):void {
            trace("securityErrorHandler: " + event);
			var file:FileReference = FileReference(event.target);
			ExternalInterface.call("alert", "Vkach: ошибка загрузки файла \"" + file.name + "\"\nв связи с возможным нарушением политики безопасности");
        }

        private function selectHandler(event:Event):void {
            var file:FileReference = FileReference(event.target);
            trace("selectHandler: name=" + file.name + " URL=" + request.url);
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
			try {
				file.cancel();
				request = new URLRequest();
				request.url = this.obj.url;
				filename = this.obj.defaultFileName;
				file.download(request, filename);
				this.obj = null;
			}
			catch(e:Error) {
				trace(e);
				ExternalInterface.call("alert", "Vkach: внутренняя ошибка");
			}
        }
	}
}

