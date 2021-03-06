import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { ICombo } from 'src/app/shared/interfaces/generales.interfaces';
import { GeneralService } from 'src/app/shared/services/generales.services';
import { MensajesSwalService } from 'src/app/utilities/swal-Service/swal.service';
import { ICrearFormasPago } from '../interface/formaspago.interface';
import { FomrasDePagoService } from '../servicio/formaspago.service';

@Component({
  selector: 'app-nueva-forma-pago',
  templateUrl: './nueva-forma-pago.component.html',
  styleUrls: ['./nueva-forma-pago.component.scss']
})
export class NuevaFormaPagoComponent implements OnInit {


public FlgLlenaronCombo: Subject<boolean> = new Subject<boolean>();
@Input() dataFormaPago : any;
@Output() cerrar : EventEmitter<any> = new EventEmitter<any>();
Form : FormGroup;
FormPagoEditar : ICrearFormasPago;

arrayMedioPago: ICombo[];
arrayEstablecimiento: ICombo[];
arrayMoneda: ICombo[];
arrayDocumento: ICombo[];
arrayDocumentoRef: ICombo[];


constructor(
  private swal : MensajesSwalService, 
  private formpagoService : FomrasDePagoService,
  private generalService : GeneralService
) { 
  this.builform();
}

public builform(){
  this.Form = new FormGroup({
    titulo: new FormControl('', Validators.required),
    mediodePago: new FormControl(null, Validators.required),
    establecimiento: new FormControl(null, Validators.required),
    moneda: new FormControl(null, Validators.required),
    documento: new FormControl(null, Validators.required),
    documentoref: new FormControl(null),
    docrequierereferencia: new FormControl(false)
  })
}

ngOnInit(): void {
  this.onCargarDropdown();
  if(this.dataFormaPago){
    this.onObtenerFormPagoPorId();
  }
}

  
onCargarDropdown(){
  const data={
    esCajaBanco : true
   }

   const data2={
    esNotaCredito : true
   }

  const obsDatos = forkJoin(   
    this.generalService.listadoPorGrupo('MediosPago'), 
    this.generalService.listadoComboEstablecimientos(), 
    this.generalService.listadoPorGrupo('Monedas'), 
    this.generalService.listadoDocumentoPortipoParacombo(data), 
    this.generalService.listadoDocumentoPortipoParacombo(data2), 
  );

  
  obsDatos.subscribe((response) => { 
    this.arrayMedioPago = response[0];   
    this.arrayEstablecimiento = response[1];  
    this.arrayMoneda = response[2];   
    this.arrayDocumento = response[3];   
    this.arrayDocumentoRef = response[4];   
    this.FlgLlenaronCombo.next(true); 
  },error => { 
    this.generalService.onValidarOtraSesion(error);  
  });
}

Avisar(){
  this.FlgLlenaronCombo.subscribe((x) => {
    this.onObtenerFormPagoPorId(); 
  });
}

onObtenerFormPagoPorId(){ 
  this.swal.mensajePreloader(true);
  this.formpagoService.formaPagoPorId(this.dataFormaPago.idFormaPago).subscribe((resp)=> {
    if(resp){ 
      this.FormPagoEditar = resp; 
  
      this.Form.patchValue({
          documento: this.arrayDocumento.find(
          (x) => x.id === this.FormPagoEditar.documentoid
          ),
          moneda: this.arrayMoneda.find(
            (x) => x.id === this.FormPagoEditar.monedaid
          ), 
          mediodePago: this.arrayMedioPago.find(
            (x) => x.id === this.FormPagoEditar.mediopagoid
          ),
          establecimiento: this.arrayEstablecimiento.find(
            (x) => x.id === this.FormPagoEditar.establecimientoid
          ), 
          documentoref: this.arrayDocumentoRef.find(
            (x) => x.id === this.FormPagoEditar.documentorefid
          ), 
          titulo: this.FormPagoEditar.titulo,
          docrequierereferencia: this.FormPagoEditar.requieredocref,
        })
      }
      this.swal.mensajePreloader(false);
  })
}

 

onGrabar(){
  const data = this.Form.value;

  const newCondicionPago : ICrearFormasPago = {
    documentoid: data.documento.id,
    documentorefid : data.documentoref ? data.documentoref.id : 0,
    establecimientoid: data.establecimiento ? data.establecimiento.id : 0,
    formaspagoid: this.FormPagoEditar ? this.FormPagoEditar.formaspagoid : 0, 
    mediopagoid: data.mediodePago.id,
    monedaid: data.moneda.id,
    requieredocref: data.docrequierereferencia,
    titulo : data.titulo
  }
 ;

  if(!this.dataFormaPago){
    this.formpagoService.crearFormaPago(newCondicionPago).subscribe((resp) => {
      if(resp){
        this.onVolver();
      }
      this.swal.mensajeExito('Se grabaron los datos correctamente!.');
    },error => { 
      this.generalService.onValidarOtraSesion(error);  
    });
  }else{
    this.formpagoService.updateFormaPago(newCondicionPago).subscribe((resp) => {
      if(resp){
        this.onVolver();
      }
      this.swal.mensajeExito('Se actualizaron los datos correctamente!.');
    },error => { 
      this.generalService.onValidarOtraSesion(error);  
    });

  }
  



}

  onVolver(){
    this.cerrar.emit('exito')
  }

  onRegresar(){
    this.cerrar.emit(false)
  }
}
