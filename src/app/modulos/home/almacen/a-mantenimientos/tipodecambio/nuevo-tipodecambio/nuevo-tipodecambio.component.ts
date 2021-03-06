import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PrimeNGConfig } from 'primeng/api';
import { ConstantesGenerales } from 'src/app/shared/interfaces/shared.interfaces';
import { GeneralService } from 'src/app/shared/services/generales.services';
import { MensajesSwalService } from 'src/app/utilities/swal-Service/swal.service';
import { ICreateTipoCambio, ITipoCambioPorId } from '../interfaces/tipocambio.interface';
import { TipoCambioService } from '../service/tipocambio.service';

@Component({
  selector: 'app-nuevo-tipodecambio',
  templateUrl: './nuevo-tipodecambio.component.html',
  styleUrls: ['./nuevo-tipodecambio.component.scss']
})
export class NuevoTipodecambioComponent implements OnInit {

  @Output() cerrar : EventEmitter<any> = new EventEmitter<any>();
  @Input() idTipoCambio : number;
  Form: FormGroup
  TipoCambioEditar : ITipoCambioPorId;
  fechaActual = new Date();
  es :any = ConstantesGenerales.ES_CALENDARIO;

  
  constructor(
    private swal : MensajesSwalService, 
    private tipocambioService : TipoCambioService,
    private readonly formatoFecha: DatePipe,
    private primengConfig : PrimeNGConfig,
    private generalService : GeneralService,
  ) { 
    this.builform();
  }

  public builform(): void { 
    this.Form = new FormGroup({
      valorCompra : new FormControl(null, Validators.required),
      valorVenta : new FormControl(null, Validators.required),
      fechatipoCambio : new FormControl(this.fechaActual, Validators.required)
    })
  }

  ngOnInit(): void { 
    this.primengConfig.setTranslation(this.es);
    if(this.idTipoCambio){ 
      this.onBuscarTipoCambioPorId();
    }
  }


  onBuscarTipoCambioPorId(){ 
    this.swal.mensajePreloader(true);
    this.tipocambioService.TipoCambioPorId(this.idTipoCambio).subscribe((resp) => {
      if(resp){
        this.TipoCambioEditar = resp; 
        let fechaActual = this.formatoFecha.transform(this.TipoCambioEditar.fechatc, ConstantesGenerales._FORMATO_FECHA_VISTA);
        this.Form.patchValue({
          valorCompra : this.TipoCambioEditar.valorcompra,
          valorVenta : this.TipoCambioEditar.valorventa,
          fechatipoCambio : fechaActual
        })
      }
      this.swal.mensajePreloader(false);
    },error => { 
      this.generalService.onValidarOtraSesion(error);  
    });
  }

  onGrabar(){
    const data  = this.Form.value; 

    const newTipoCambio : ICreateTipoCambio = {
      fechatc : this.formatoFecha.transform(data.fechatipoCambio, ConstantesGenerales._FORMATO_FECHA_BUSQUEDA), 
      valorcompra: data.valorCompra,
      valorventa : data.valorVenta,
      tipodecambioid : this.idTipoCambio ? this.idTipoCambio : 0 ,
    } 
    if(!this.TipoCambioEditar){
      this.tipocambioService.createTipoCambio(newTipoCambio).subscribe((resp)=> {
       if(resp){
          this.onVolver();
        }
        this.swal.mensajeExito('Se grabaron los datos correctamente!.');
      },error => { 
        this.generalService.onValidarOtraSesion(error);  
      });
    }else{
      this.tipocambioService.updateTipoCambio(newTipoCambio).subscribe((resp)=> {
        if(resp){
           this.onVolver();
         }
         this.swal.mensajeExito('Se actualizarion los datos correctamente!.');
        },error => { 
          this.generalService.onValidarOtraSesion(error);  
        });
    }
  }



  onVolver(){ 
    this.cerrar.emit('exito');
  }

  onRegresar(){ 
    this.cerrar.emit(false);
  }


}
