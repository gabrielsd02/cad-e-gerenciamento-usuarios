'use client'

interface Props {
	title: string;
	message: string;
	onClose():void;
	onConfirm():void;
}

export default function Modal({
	onClose,
	onConfirm,
	message,
	title,
}: Props) {
  return (
		<div
		className="absolute inset-0 z-[999] grid h-screen w-screen place-items-center bg-gray-900/50 transition-opacity duration-300"
		>
		<div
			className="relative m-4 p-4 w-2/5 min-w-[40%] max-w-[60%] rounded-lg bg-gray-400 shadow-sm min-h-48"
		>
			<div className="flex items-center pb-4 text-xl font-medium text-slate-800">
				{title}
			</div>
			<div className="relative border-t border-slate-200 py-4 leading-normal">
				{message}
			</div>
			<div className="flex flex-wrap items-center pt-5 justify-between">
				<button 
					type="button"
					onClick={onClose}
				>
					Cancelar
				</button>
				<button 
					type="button"
					onClick={onConfirm}
				>
					Confirmar
				</button>
			</div>
		</div>
	</div>
  )
}