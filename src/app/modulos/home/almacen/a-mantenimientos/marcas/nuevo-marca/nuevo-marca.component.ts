import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GeneralService } from 'src/app/shared/services/generales.services';
import { MensajesSwalService } from 'src/app/utilities/swal-Service/swal.service';
import { ICrearMarca } from '../interface/marca.interface';
import { MarcaService } from '../service/marca.service';

@Component({
  selector: 'app-nuevo-marca',
  templateUrl: './nuevo-marca.component.html',
  styleUrls: ['./nuevo-marca.component.scss']
})
export class NuevoMarcaComponent implements OnInit {

  @Input() idMarcaEdit : any;
  @Output() cerrar : EventEmitter<any> = new EventEmitter<any>();
  Form : FormGroup;
  dataMarcaEdit : ICrearMarca;

  constructor(    
    private swal : MensajesSwalService, 
    private marcaService : MarcaService,
    private generalService : GeneralService,
  ) {
    this.builform();
   }

   public builform(): void {
    this.Form = new FormGroup({ 
      nombreMarca: new FormControl(null, Validators.required), 
    })
  }

  ngOnInit(): void {
    if(this.idMarcaEdit){ 
      this.onObtenerMarcaPorId();
    }
  }

  onObtenerMarcaPorId(){
    this.swal.mensajePreloader(true);
    this.marcaService.marcaPorId(this.idMarcaEdit).subscribe((resp) => {
      if(resp){
        this.dataMarcaEdit = resp;
        this.Form.patchValue({
          nombreMarca : this.dataMarcaEdit.nombre
        })
      }
      this.swal.mensajePreloader(false);
    },error => { 
      this.generalService.onValidarOtraSesion(error);
    });
  }


  
  onGrabar(){
    const data = this.Form.value;

    const newMarca : ICrearMarca = {
      nombre : data.nombreMarca,
      marcaid: this.idMarcaEdit ? this.idMarcaEdit : 0,
      codigo : this.dataMarcaEdit ? this.dataMarcaEdit.codigo : null 
    }
 
    if(!this.idMarcaEdit){
      this.marcaService.createMarca(newMarca).subscribe((resp) => {
        if(resp){
          this.onVolver();
        }
        this.swal.mensajeExito('Se grabaron los datos correctamente!.');
      },error => { 
        this.generalService.onValidarOtraSesion(error);
      });
    }else{
      this.marcaService.updateMarca(newMarca).subscribe((resp) => {
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
