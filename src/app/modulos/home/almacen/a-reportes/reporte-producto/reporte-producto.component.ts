import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { GeneralService } from 'src/app/shared/services/generales.services';
import { MensajesSwalService } from 'src/app/utilities/swal-Service/swal.service';
import { IReporte } from '../../a-mantenimientos/productos/interface/producto.interface'; 
import { ReportesAlmacenService } from '../services/reporte.service';

@Component({
  selector: 'app-reporte-producto',
  templateUrl: './reporte-producto.component.html'
})
export class ReporteProductoComponent   {

  modalBuscarProducto : boolean = false;
  codProductoSeleccionado = new FormControl('', Validators.required)
  fechayhora = new FormControl(true, Validators.required)
  codProductoSearch : string = "";
  contenidoReporte : IReporte;
  Pdf : any;
  urlGenerate : any;
  dataProductos :any;

  constructor(
    private reporteService : ReportesAlmacenService,
    public sanitizer: DomSanitizer,
    private swal : MensajesSwalService,
    private generalService : GeneralService
  ) { }

 


  onModalBuscarProducto(){
    const data = {
      idAlmacenSelect : 0,
      idPosicionProducto : 0
    }
    this.dataProductos = data;
    this.modalBuscarProducto = true;
  }

  onPintarProductoSeleccionado(event : any){     
    if(event){
      this.codProductoSearch = event.data.codProducto 
      this.codProductoSeleccionado.setValue(event.data.codProducto + ' / '+ event.data.nombreProducto);
      this.modalBuscarProducto= false;
    }
  }


  onGenerarReporte(){
    const data = {
      idlinea : -1,
      orderBy : -1,
      estado : 1,
      tipoProducto : 0,
      hayFechaHora : this.fechayhora.value,
      byLine : false, 
      productoCodigo : this.codProductoSearch
    } 
    this.swal.mensajePreloader(true);
    this.reporteService.generarReporteProductos(data).subscribe((resp) => { 
      if(resp){ 
        this.contenidoReporte = resp    
        var blob = new Blob([this.onBase64ToArrayBuffer(this.contenidoReporte.contentBytes)], {type: "application/pdf"});
        const url = URL.createObjectURL(blob);    
        this.urlGenerate = url;
        this.Pdf= this.sanitizer.bypassSecurityTrustResourceUrl(this.urlGenerate); 
      }   
      this.swal.mensajePreloader(false);
    },error => { 
      this.generalService.onValidarOtraSesion(error);  
    });
  }

  onBase64ToArrayBuffer(base64) {
    const binary_string = window.atob(this.contenidoReporte.contentBytes);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    } 
    return bytes.buffer;
  }
 

}
