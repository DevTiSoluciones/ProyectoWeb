import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';  
import { GeneralService } from 'src/app/shared/services/generales.services';
import { MensajesSwalService } from 'src/app/utilities/swal-Service/swal.service';
import { ICrearChofer } from '../interface/transportista.interface';
import { TransportistaService } from '../service/transportista.service';

@Component({
  selector: 'app-nuevo-chofer',
  templateUrl: './nuevo-chofer.component.html',
  styleUrls: ['./nuevo-chofer.component.scss']
})
export class NuevoChoferComponent implements OnInit {

  
  tituloVistaChofer :string = "NUEVO CHOFER"; 
  @Output() cerrar : EventEmitter<any> = new EventEmitter<any>();
  @Input() dataChofer! : any;
  EditarChofer : ICrearChofer 
  Form : FormGroup;

  ubigeoSeleccionado : string = '';
  ubigeoParaMostrar : string =""; 
  modalBuscarUbigeo : boolean = false;
 
  constructor(
    private transpService: TransportistaService,
    private generalService : GeneralService,
    private swal : MensajesSwalService
  ) { 
    this.builform();
  }

  ngOnInit(): void { 
    if(this.dataChofer.idChofer){
      this.tituloVistaChofer = "EDITAR CHOFER";
      this.onObtenerDataChoferEditar();
    }
  }


  private builform(): void {
    this.Form = new FormGroup({ 
      brevete: new FormControl(null),   
      nroDocumento: new FormControl(null, Validators.required), 
      apellidos: new FormControl(null),   
      nombres: new FormControl(null),  
      direccionprincipal: new FormControl(null),   
    });
  }

  onBuscarPorNumeroDocumento(){ 
    const nroDocumento  = this.Form.controls['nroDocumento'].value;
 
    if(!nroDocumento){
      this.swal.mensajeAdvertencia('porfavor ingrese un numero de documento');
      return;
    } 
 
    if(nroDocumento.toString().length === 8){
      this.swal.mensajePreloader(true)
      this.generalService.consultaPorDni(nroDocumento).subscribe((resp) => {
        if(resp.dni){
          this.Form.patchValue({
            apellidos : resp.apePaterno + ' ' + resp.apeMaterno,
            nombres : resp.nombres
          });
          this.swal.mensajePreloader(false)
        }else{
          this.swal.mensajeError('No se encontraron datos.');
          this.limpiarForm(); 
        }
      },error => {  
        this.swal.mensajeError(error.error.errors.dni[0]);  
      })
    }else{
      this.swal.mensajeAdvertencia('porfavor ingrese un numero de documento valido');
    }
  }


  limpiarForm(){
    this.Form.controls['nroDocumento'].setValue('');
    this.Form.controls['apellidos'].setValue('');
    this.Form.controls['nombres'].setValue('');
  }
 
  
 
  onObtenerDataChoferEditar(){ 
    this.swal.mensajePreloader(true)
    this.transpService.choferporId(this.dataChofer.idChofer).subscribe((resp) => { 
      if(resp){
        this.swal.mensajePreloader(false)
        this.EditarChofer = resp; 
        this.Form.patchValue({ 
          nroDocumento: this.EditarChofer.personaData.nrodocumentoidentidad, 
          apellidos: this.EditarChofer.personaData.apellidos,   
          nombres: this.EditarChofer.personaData.nombres, 
          brevete: this.EditarChofer.brevete, 
          direccionprincipal: this.EditarChofer.personaData.direccionprincipal
        })
      }
    },error => { 
      this.generalService.onValidarOtraSesion(error);  
    });
  }

  onBuscarUbigeo(){
    this.modalBuscarUbigeo = true;
  }

  onPintarUbigeoSeleccionado( data : any){ 
    if(data){
      this.ubigeoParaMostrar = data.nombreubigeo;
      this.ubigeoSeleccionado = data.ubigeo; 
    }
    this.modalBuscarUbigeo = false;
  }


  onGrabarChofer(){ 
    const data  = this.Form.value; 
    const newChofer : ICrearChofer = {
      brevete : data.brevete,
      personaData:{
        apellidos: data.apellidos, 
        nombres: data.nombres,
        categoriapersona : 0,
        direccionesAnexos: [],
        nrodocumentoidentidad : data.nroDocumento,
        personaid:  this.EditarChofer ? this.EditarChofer.personaData.personaid : 0,
        tipodocumentoid :1,
        tipopersonaid: 1, 
        razonsocial : '',
        ubigeoprincipal : this.ubigeoSeleccionado,
        direccionprincipal: data.direccionprincipal
      },
      personaid : this.EditarChofer ? this.EditarChofer.personaData.personaid : 0,
      transportistaid : this.dataChofer.idTransportista,
   
    } 

    //SI LLEGA DATA PARA EDITAR ENTONCES SE INSERTA UN NUEVO REGISTRO DE LO CONTRARIO SE ACTUALIZA
    if (!this.EditarChofer) {
      this.transpService.grabarChofer(newChofer).subscribe((resp) => {
        if(resp){
          this.onVolver();
        }
        this.swal.mensajeExito('Se grabaron los datos correctamente!.');
      },error => { 
        this.generalService.onValidarOtraSesion(error);  
      });
    }else { 
      this.transpService.updateChofer(newChofer).subscribe((resp) =>{
        if(resp){
          this.onVolver();
        }
        this.swal.mensajeExito('Se actualizaron los datos correctamente!.');
      },error => { 
        this.generalService.onValidarOtraSesion(error);  
      });
    }
  }


  onRegresar() {   
    this.cerrar.emit(false); 
  }


  onVolver() {   
    this.cerrar.emit('exito'); 
  }


  validateNumber(event) {
    let key;
    if (event.type === 'paste') {
      key = event.clipboardData.getData('text/plain');
    } else {
      key = event.keyCode;
      key = String.fromCharCode(key);
    }
    const regex = /[0-9]|\./;
     if (!regex.test(key)) {
      event.returnValue = false;
       if (event.preventDefault) {
        event.preventDefault();
       }
     }
    }

    
}
