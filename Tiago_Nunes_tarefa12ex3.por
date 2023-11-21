programa {
  funcao inicio() {
    inteiro num_alunos,count=0,countm=0,countf=0,maisvelho=0,maisnovo=100,idade
    cadeia nome,nomemaisvelho,nomemaisnovo
    caracter sexo

    escreva("Digite o número de alunos da turma: ")
    leia(num_alunos)

    enquanto(count<num_alunos)
    
    {
      escreva(count+1,"º Aluno \n")
      escreva("Nome:\n")
      leia(nome)
      escreva("Idade:\n")
      
      leia(idade)
      se(idade>maisvelho) 
      {
        maisvelho=idade
        nomemaisvelho=nome
      }
      senao se(idade<maisnovo)
       {
        maisnovo = idade
        nomemaisnovo=nome}
      
      escreva("Sexo:\n")
      leia(sexo)
      se(sexo=="M" ou sexo=="m") countm++
      senao se(sexo=="F" ou sexo=="f") countf++

      count++





    }

    escreva("O aluno mais velho é o ",nomemaisvelho," com ",maisvelho," anos.\n")
    escreva("O aluno mais novo é o ",nomemaisnovo," com ",maisnovo," anos.\n")
    escreva("Existem ",countm," alunos do sexo masculino.\n")
    escreva("Existem ",countf," alunos do sexo feminino.\n")


    }

  


    
  }

