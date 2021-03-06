import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { PrimeNGConfig } from 'primeng/api';
import { ConstantesGenerales } from 'src/app/shared/interfaces/shared.interfaces';
import { GeneralService } from 'src/app/shared/services/generales.services';
import { MensajesSwalService } from 'src/app/utilities/swal-Service/swal.service';
import { IModuloReporte } from '../../../almacen/a-mantenimientos/productos/interface/producto.interface';
import { ReportesComprasService } from '../service/reportescompras.service';


@Component({
  selector: 'app-detracciones',
  templateUrl: './detracciones.component.html'
})
export class DetraccionesComponent implements OnInit {

  es = ConstantesGenerales.ES_CALENDARIO;
  contenidoReporte : IModuloReporte;
  Pdf : any;
  urlGenerate : any; 
  Form : FormGroup;

  constructor(
    private reporteService : ReportesComprasService, 
    public sanitizer: DomSanitizer,
    private swal : MensajesSwalService,
    private config : PrimeNGConfig,
    private dataform : DatePipe,
    private generalService : GeneralService
  ) {
    this.builform();
  }
  
  public builform(){ 
    this.Form = new FormGroup({ 
      fechaInicio : new FormControl(new Date),
      fechaFin : new FormControl(new Date),  
    })
  }

  ngOnInit(): void {
    this.config.setTranslation(this.es) 
  }
 
  onGenerarReporte(){
    const data = this.Form.value;  
    const params = {
      tipoPresentacion : 'PDF',  
      f1 :  this.dataform.transform(data.fechaInicio, ConstantesGenerales._FORMATO_FECHA_BUSQUEDA),
      f2 :  this.dataform.transform(data.fechaFin, ConstantesGenerales._FORMATO_FECHA_BUSQUEDA), 
    }
  
    this.swal.mensajePreloader(true); 
    this.reporteService.generarReporteDetraccion(params).subscribe((resp) => { 
      if(resp){ 
        this.contenidoReporte = resp    
        var blob = new Blob([this.onBase64ToArrayBuffer(this.contenidoReporte.fileContent)], {type: "application/pdf"});
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
    const binary_string = window.atob(this.contenidoReporte.fileContent);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    } 
    return bytes.buffer;
  }
 
}