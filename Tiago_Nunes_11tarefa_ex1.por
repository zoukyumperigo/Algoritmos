programa {
  inteiro numint
  funcao inicio() {

    escreva("Digite um n�mero natural de 1 a 10.\n")
    leia(numint)

    se(numint>0 e numint<=10 ) escreva(numint," � v�lido.\n")
    senao{
      escreva(numint,"� inv�lido.\n Digite novamente um n�mero natural de 1 a 10\n")
      leia(numint)

    }

    para(inteiro i=1;i<11;i++ ){
      escreva(numint,"X",i,"=",numint*i,"\n")

    }


    
  }
}
