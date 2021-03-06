import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { PrimeNGConfig } from 'primeng/api';  
import { ConstantesGenerales } from 'src/app/shared/interfaces/shared.interfaces';
import { GeneralService } from 'src/app/shared/services/generales.services';
import { MensajesSwalService } from 'src/app/utilities/swal-Service/swal.service';
import { IReporte } from '../../../almacen/a-mantenimientos/productos/interface/producto.interface';
import { ReportesVentasService } from '../service/reportesventas.service';

@Component({
  selector: 'app-ventas-por-producto-rep-resumen-utilidad',
  templateUrl: './ventas-por-producto-rep-resumen-utilidad.component.html'
})
export class VentasPorProductoRepResumenUtilidadComponent implements OnInit {
 
  modalBuscarPersona : boolean = false;
  existeClienteSeleccionado: boolean = false;
  es = ConstantesGenerales.ES_CALENDARIO; 
  Pdf : any;
  Form : FormGroup;
  urlGenerate : any;   
  contenidoReporte : IReporte; 
 
  constructor(
    private reporteService : ReportesVentasService,  
    private swal : MensajesSwalService,
    private config : PrimeNGConfig,
    private dataformat : DatePipe,
    public sanitizer: DomSanitizer, 
    private generalService: GeneralService
  ) {
    this.builform();
  }

  public builform(){ 
    this.Form = new FormGroup({ 
      fechaInicio : new FormControl(new Date),
      fechaFin : new FormControl(new Date), 
      nombreCliente : new FormControl(null)
    })
  }

  ngOnInit(): void {
    this.config.setTranslation(this.es) 
  }
 
  onGenerarReporte(){  
    const data = this.Form.value;   
    const Params = { 
      f1 :  this.dataformat.transform(data.fechaInicio, ConstantesGenerales._FORMATO_FECHA_BUSQUEDA),
      f2 :  this.dataformat.transform(data.fechaFin, ConstantesGenerales._FORMATO_FECHA_BUSQUEDA), 
      establecimiento: 1,  
    } 

    this.swal.mensajePreloader(true); 
    this.reporteService.generarReporteVentaProdcutoResumenUtilidad(Params).subscribe((resp) => { 
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
