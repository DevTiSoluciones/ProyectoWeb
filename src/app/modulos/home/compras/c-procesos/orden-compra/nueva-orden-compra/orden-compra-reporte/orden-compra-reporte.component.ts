import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MensajesSwalService } from 'src/app/utilities/swal-Service/swal.service'; 
import { saveAs } from 'file-saver';
import { OrdenCompraService } from '../../service/ordencompraService';
import { IModuloReporte } from 'src/app/modulos/home/almacen/a-mantenimientos/productos/interface/producto.interface';
import { GeneralService } from 'src/app/shared/services/generales.services';

@Component({
  selector: 'app-orden-compra-reporte',
  templateUrl: './orden-compra-reporte.component.html',
  styleUrls: ['./orden-compra-reporte.component.scss']
})
export class OrdenCompraReporteComponent   {
 
  @Output() cerrar : EventEmitter<any> = new EventEmitter<any>();
  @Input() dataReporte : any;
  contenidoReporte : IModuloReporte;
  Pdf : any;
  urlGenerate : any;
 
  constructor(
    private ocService : OrdenCompraService,
    public sanitizer: DomSanitizer,
    private swal : MensajesSwalService,
    private generalService: GeneralService
  ) { }

 
  
  onGenerarReporte(){
    this.swal.mensajePreloader(true);
    const data = {
     tipo : 'PDF',
     idOrdenCompra : this.dataReporte.compraid
    }
    this.ocService.generarReporte(data).subscribe((resp) => { 
      if(resp){ 
        this.contenidoReporte = resp    
        var blob = new Blob([this.onBase64ToArrayBuffer(this.contenidoReporte.fileContent)], {type: "application/pdf"});
        const url = URL.createObjectURL(blob);    
        this.urlGenerate = url;
        this.Pdf= this.sanitizer.bypassSecurityTrustResourceUrl(this.urlGenerate); 
        this.swal.mensajePreloader(false);
      }   
    },error => { 
      this.generalService.onValidarOtraSesion(error);  
    });
  }
  
  onBase64ToArrayBuffer(base64) {
    const binary_string = window.atob(this.contenidoReporte.fileContent);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    } 
    return bytes.buffer;
  }
 
  
  onDescargar(){
    var blob = new Blob([this.onBase64ToArrayBuffer(this.contenidoReporte.fileContent)], {type: "application/pdf"}); 
    saveAs(blob, "Productos.pdf");
  }
 

  onRegresar(){
    this.cerrar.emit(false)
  }


}
