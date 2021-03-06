import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { ICombo } from 'src/app/shared/interfaces/generales.interfaces';
import { GeneralService } from 'src/app/shared/services/generales.services';
import { MensajesSwalService } from 'src/app/utilities/swal-Service/swal.service';
import { IEstablecimientoCrearSerie, IEstablecimientoSeries } from '../../interface/establecimiento.interface';
import { EstablecimientoService } from '../../service/establecimiento.service';

@Component({
  selector: 'app-nuevo-serie',
  templateUrl: './nuevo-serie.component.html',
  styleUrls: ['./nuevo-serie.component.scss']
})
export class NuevoSerieComponent implements OnInit {

  public FlgLlenaronCombo: Subject<boolean> = new Subject<boolean>();
  @Input() dataEdit : any;
  @Output() cerrar : EventEmitter<any> = new EventEmitter<any>();
  Form : FormGroup;  
  arrayDocumentos : ICombo[];
  dataEditarSerie : IEstablecimientoCrearSerie;

  constructor(
    private swal : MensajesSwalService, 
    private establecimientoService : EstablecimientoService,
    private generalService : GeneralService
  ) { 
    this.builform();
  }

  
  public builform(): void {
    this.Form = new FormGroup({ 
      documento: new FormControl(null, Validators.required),
      serie: new FormControl(null, Validators.required), 
      predeterminado: new FormControl(false, Validators.required), 
    })
  }

  ngOnInit(): void { 
    this.onCargarDropDown(); 

    if(this.dataEdit.idSerieEditar){ 
      this.swal.mensajePreloader(true);
      this.Avisar(); 
    }

  }

  
  onCargarDropDown(){
    const obsDatos = forkJoin( 
      this.generalService.listadoComboSerie(), 
    );

    obsDatos.subscribe((response) => {
      this.arrayDocumentos = response[0];  
      this.FlgLlenaronCombo.next(true); 
    },error => { 
      this.generalService.onValidarOtraSesion(error);
    });
  }

 
  Avisar() {
    this.FlgLlenaronCombo.subscribe((x) => {  
        this.onObtenerSeriePorId();  
    });
  }


  onObtenerSeriePorId(){ 
    this.establecimientoService.seriesPorid(this.dataEdit.idSerieEditar).subscribe((resp)=>{
      if(resp){ 
        this.dataEditarSerie = resp;
        this.Form.patchValue({ 
          documento: this.arrayDocumentos.find(
            (x) => x.id === this.dataEditarSerie.documentoid
            ),
            serie: this.dataEditarSerie.serie,
            predeterminado: this.dataEditarSerie.espredeterminada
          }) 
        } 
        this.swal.mensajePreloader(false);
    },error => { 
      this.generalService.onValidarOtraSesion(error);
    });
  }


  onGrabar(){
    const data = this.Form.value;
    const newSerie : IEstablecimientoCrearSerie = {
      documentoid :  data.documento.id,
      espredeterminada : data.predeterminado,
      establecimientoid : this.dataEdit.idEstablecimiento,
      establecimientoserieid : this.dataEdit ? this.dataEdit.idSerieEditar :  0,
      serie : data.serie, 
    }

    if(!this.dataEdit.idSerieEditar){
      this.establecimientoService.crearSerie(newSerie).subscribe((resp)=>{
        if(resp){
          this.onVolver();
        }
        this.swal.mensajeExito('Se grabaron los datos correctamente!.')
      },error => { 
        this.generalService.onValidarOtraSesion(error);
      });
    }else{
      this.establecimientoService.updateSerie(newSerie).subscribe((resp)=>{
        if(resp){
          this.onVolver();
        }
        this.swal.mensajeExito('Se actualizaron los datos correctamente!.')
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
